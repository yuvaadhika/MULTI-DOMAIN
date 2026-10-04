import { io, Socket } from 'socket.io-client';
import { MultiplayerSession, MultiplayerParticipant, UserRole } from '../types/simulation';
import { INITIAL_MULTIPLAYER_LOBBY } from '../data/seedData';

class MultiplayerService {
  private socket: Socket | null = null;
  private localSession: MultiplayerSession = INITIAL_MULTIPLAYER_LOBBY;
  private listeners: Map<string, Array<(data: any) => void>> = new Map();

  constructor() {
    try {
      this.socket = io('http://localhost:3002', {
        autoConnect: false,
        reconnectionAttempts: 2,
        timeout: 3000
      });

      this.socket.on('session:updated', (session: MultiplayerSession) => {
        this.localSession = session;
        this.emit('session:updated', session);
      });

      this.socket.on('participant:joined', (participant: MultiplayerParticipant) => {
        this.emit('participant:joined', participant);
      });

      this.socket.on('sim:state_sync', (state: any) => {
        this.emit('sim:state_sync', state);
      });

      this.socket.on('msg:received', (message: any) => {
        this.emit('msg:received', message);
      });

      this.socket.on('decision:received', (decision: any) => {
        this.emit('decision:received', decision);
      });

      this.socket.on('sim:event_injected', (event: any) => {
        this.emit('sim:event_injected', event);
      });

      this.socket.on('sim:channels_restored', () => {
        this.emit('sim:channels_restored', null);
      });
    } catch {
      // Offline fallback initialized
    }
  }

  public connect(): void {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }

  public on(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);

    return () => {
      const list = this.listeners.get(event) || [];
      this.listeners.set(event, list.filter(cb => cb !== callback));
    };
  }

  private emit(event: string, data: any): void {
    const list = this.listeners.get(event) || [];
    list.forEach(cb => cb(data));
  }

  public createSession(scenarioId: string, scenarioName: string, instructorName: string): MultiplayerSession {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      if (i === 3) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const session: MultiplayerSession = {
      sessionCode: code,
      scenarioId,
      scenarioName,
      status: 'LOBBY',
      hostInstructor: {
        id: `user-inst-${Date.now()}`,
        name: instructorName || 'Major Marcus Vance',
        connected: true
      },
      participants: [
        {
          id: 'user-trainee-1',
          name: 'Capt. Jonathan Thorne',
          callsign: 'ALPHA-ACTUAL',
          role: 'COMMANDER',
          domain: 'LAND',
          status: 'CONNECTED',
          joinedAt: new Date().toLocaleTimeString()
        },
        {
          id: 'user-trainee-2',
          name: 'Lt. Sarah Hayes',
          callsign: 'RECON-ONE',
          role: 'GROUND_OBSERVER',
          domain: 'LAND',
          status: 'CONNECTED',
          joinedAt: new Date().toLocaleTimeString()
        },
        {
          id: 'user-trainee-3',
          name: 'Lt. David Kim',
          callsign: 'SKYWATCH-LEAD',
          role: 'AIR_OBSERVER',
          domain: 'AIR',
          status: 'CONNECTED',
          joinedAt: new Date().toLocaleTimeString()
        },
        {
          id: 'user-trainee-4',
          name: 'Staff Sgt. Elena Mercer',
          callsign: 'NETWORK-LEAD',
          role: 'NETWORK_OBSERVER',
          domain: 'CYBER',
          status: 'WAITING',
          joinedAt: new Date().toLocaleTimeString()
        }
      ],
      maxParticipants: 4,
      createdAt: new Date().toISOString()
    };

    this.localSession = session;
    this.emit('session:updated', session);

    if (this.socket && this.socket.connected) {
      this.socket.emit('session:create', { scenarioId, scenarioName, instructorName });
    }

    return session;
  }

  public joinSession(sessionCode: string, name: string, callsign: string, role: UserRole): { success: boolean; session?: MultiplayerSession; error?: string } {
    const code = sessionCode.trim().toUpperCase();
    if (!code) {
      return { success: false, error: 'Please enter a valid session code.' };
    }

    const participant: MultiplayerParticipant = {
      id: `usr-${Date.now()}`,
      name: name || 'Trainee Operator',
      callsign: callsign || 'OPERATOR-1',
      role,
      domain: role === 'AIR_OBSERVER' ? 'AIR' : role === 'NETWORK_OBSERVER' ? 'CYBER' : 'LAND',
      status: 'CONNECTED',
      joinedAt: new Date().toLocaleTimeString()
    };

    // Update local session
    const updatedParticipants = [...this.localSession.participants.filter(p => p.role !== role), participant];
    this.localSession = {
      ...this.localSession,
      sessionCode: code,
      participants: updatedParticipants
    };

    this.emit('session:updated', this.localSession);
    this.emit('participant:joined', participant);

    if (this.socket && this.socket.connected) {
      this.socket.emit('session:join', { sessionCode: code, participant });
    }

    return { success: true, session: this.localSession };
  }

  public getSession(): MultiplayerSession {
    return this.localSession;
  }
}

export const multiplayerService = new MultiplayerService();
