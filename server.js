import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const PORT = process.env.SERVER_PORT || 3002;

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(express.json());

// In-memory active multiplayer sessions
const activeSessions = new Map();

// Generate 6-char session code: e.g., "M7K-42Q"
function generateSessionCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    if (i === 3) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// REST endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'SENTINEL-X C2 SIMULATION BACKEND',
    activeSessionsCount: activeSessions.size,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/sessions/:code', (req, res) => {
  const session = activeSessions.get(req.params.code.toUpperCase());
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json(session);
});

app.post('/api/sessions', (req, res) => {
  const { scenarioId, scenarioName, instructorName, maxParticipants } = req.body;
  const sessionCode = generateSessionCode();
  
  const newSession = {
    sessionCode,
    scenarioId: scenarioId || 'scen-meridian',
    scenarioName: scenarioName || 'Operation Meridian',
    status: 'LOBBY',
    hostInstructor: {
      id: `inst-${Date.now()}`,
      name: instructorName || 'Instructor Control',
      connected: true
    },
    participants: [],
    maxParticipants: maxParticipants || 4,
    createdAt: new Date().toISOString()
  };

  activeSessions.set(sessionCode, newSession);
  res.json(newSession);
});

// Realtime Socket.IO Gateway
io.on('connection', (socket) => {
  console.log(`[SOCKET CONNECTED] Client ID: ${socket.id}`);

  // Create Session
  socket.on('session:create', (payload, callback) => {
    const sessionCode = generateSessionCode();
    const sessionData = {
      sessionCode,
      scenarioId: payload?.scenarioId || 'scen-meridian',
      scenarioName: payload?.scenarioName || 'Operation Meridian',
      status: 'LOBBY',
      hostInstructor: {
        id: socket.id,
        name: payload?.instructorName || 'Major Marcus Vance',
        connected: true
      },
      participants: [],
      maxParticipants: payload?.maxParticipants || 4,
      createdAt: new Date().toISOString()
    };

    activeSessions.set(sessionCode, sessionData);
    socket.join(sessionCode);

    if (callback) callback({ success: true, session: sessionData });
    io.to(sessionCode).emit('session:updated', sessionData);
  });

  // Join Session
  socket.on('session:join', ({ sessionCode, participant }, callback) => {
    const code = sessionCode?.toUpperCase();
    const session = activeSessions.get(code);

    if (!session) {
      if (callback) callback({ success: false, error: 'Session code not found' });
      return;
    }

    // Check if participant already in room
    const existingIdx = session.participants.findIndex(p => p.id === participant.id);
    const updatedParticipant = {
      ...participant,
      id: participant.id || socket.id,
      status: 'CONNECTED',
      joinedAt: new Date().toLocaleTimeString()
    };

    if (existingIdx >= 0) {
      session.participants[existingIdx] = updatedParticipant;
    } else {
      session.participants.push(updatedParticipant);
    }

    socket.join(code);
    activeSessions.set(code, session);

    if (callback) callback({ success: true, session });
    io.to(code).emit('session:updated', session);
    io.to(code).emit('participant:joined', updatedParticipant);
  });

  // Broadcast Simulation State
  socket.on('sim:state_sync', ({ sessionCode, state }) => {
    socket.to(sessionCode).emit('sim:state_sync', state);
  });

  // Relay Message
  socket.on('msg:send', ({ sessionCode, message }) => {
    io.to(sessionCode).emit('msg:received', message);
  });

  // Relay Decision
  socket.on('decision:submit', ({ sessionCode, decision }) => {
    io.to(sessionCode).emit('decision:received', decision);
  });

  // Relay Injections
  socket.on('sim:inject_event', ({ sessionCode, event }) => {
    io.to(sessionCode).emit('sim:event_injected', event);
  });

  // Relay Channel Restoration
  socket.on('sim:restore_channels', ({ sessionCode }) => {
    io.to(sessionCode).emit('sim:channels_restored');
  });

  socket.on('disconnect', () => {
    console.log(`[SOCKET DISCONNECTED] Client ID: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`SENTINEL-X Socket.IO / Express Server active on http://localhost:${PORT}`);
});
