import React, { useState } from 'react';
import { 
  Users, 
  Copy, 
  Check, 
  Play, 
  ShieldAlert, 
  Radio, 
  Clock, 
  UserPlus, 
  Layers, 
  RotateCcw,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationStore';
import { UserRole } from '../../types/simulation';

export const SessionLobby: React.FC = () => {
  const { 
    multiplayerSession, 
    currentUser, 
    setCurrentUser, 
    startSimulation, 
    setCurrentView,
    createMultiplayerSession,
    joinMultiplayerSession,
    activeScenario,
    setToast 
  } = useSimulation();

  const [copied, setCopied] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState(multiplayerSession.sessionCode || 'M7K-42Q');
  const [joinName, setJoinName] = useState('');
  const [joinCallsign, setJoinCallsign] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('COMMANDER');

  const isInstructor = currentUser.role === 'INSTRUCTOR';
  const sessionCode = multiplayerSession.sessionCode || 'M7K-42Q';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sessionCode);
    setCopied(true);
    setToast({ message: `Session Code ${sessionCode} copied to clipboard.`, type: 'info' });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleStartExercise = () => {
    startSimulation();
    setCurrentView('LIVE_SIMULATION');
    setToast({ message: `Exercise ${multiplayerSession.scenarioName} is now LIVE.`, type: 'success' });
  };

  const handleCreateNewSession = () => {
    const fresh = createMultiplayerSession(activeScenario.id, activeScenario.name, currentUser.name);
    setToast({ message: `New exercise session initialized: ${fresh.sessionCode}`, type: 'success' });
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = joinMultiplayerSession(joinCode, joinName || 'Operator', joinCallsign || 'ALPHA-OP', selectedRole);
    if (result.success) {
      setShowJoinModal(false);
      setToast({ message: `Joined exercise session as ${selectedRole}`, type: 'success' });
    } else {
      setToast({ message: result.error || 'Failed to join session', type: 'error' });
    }
  };

  const allRoles: { role: UserRole; title: string; domain: string }[] = [
    { role: 'COMMANDER', title: 'Sub-Unit Commander', domain: 'LAND' },
    { role: 'GROUND_OBSERVER', title: 'Ground Recon Observer', domain: 'LAND' },
    { role: 'AIR_OBSERVER', title: 'Aerial Sensor Controller', domain: 'AIR' },
    { role: 'NETWORK_OBSERVER', title: 'Network & Sensor Analyst', domain: 'CYBER' },
    { role: 'OBSERVER', title: 'Faculty / Evaluator (Read-Only)', domain: 'LAND' }
  ];

  const connectedCount = multiplayerSession.participants.filter(p => p.status === 'CONNECTED').length;

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto font-mono select-none max-w-5xl mx-auto space-y-6 text-slate-900">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-bold uppercase">
                EXERCISE LOBBY
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">Multiplayer Session Hub</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-wider">
              {multiplayerSession.scenarioName || 'OPERATION MERIDIAN'}
            </h1>
          </div>

          {/* Session Code Highlight Card */}
          <div className="flex items-center space-x-3 bg-[#f8fafc] border border-slate-200 px-4 py-2.5 rounded-lg shadow-2xs">
            <div>
              <div className="text-[10px] uppercase text-slate-500 font-semibold">
                Session Code
              </div>
              <div className="text-lg font-bold text-sky-700 font-mono tracking-widest">
                {sessionCode}
              </div>
            </div>
            <button
              onClick={handleCopyCode}
              title="Copy Session Code"
              className="p-2 rounded bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors shadow-2xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Lobby Status Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-[#f8fafc] border border-slate-200 p-3 rounded-lg">
            <div className="text-[10px] uppercase text-slate-500 font-semibold">Instructor Node</div>
            <div className="text-sm font-bold text-emerald-700 flex items-center space-x-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>{multiplayerSession.hostInstructor.connected ? 'Connected' : 'Standby'}</span>
            </div>
          </div>

          <div className="bg-[#f8fafc] border border-slate-200 p-3 rounded-lg">
            <div className="text-[10px] uppercase text-slate-500 font-semibold">Participants</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {connectedCount} / {multiplayerSession.maxParticipants} Ready
            </div>
          </div>

          <div className="bg-[#f8fafc] border border-slate-200 p-3 rounded-lg">
            <div className="text-[10px] uppercase text-slate-500 font-semibold">Exercise Region</div>
            <div className="text-sm font-bold text-sky-700 mt-0.5">Meridian Training Area</div>
          </div>

          <div className="bg-[#f8fafc] border border-slate-200 p-3 rounded-lg">
            <div className="text-[10px] uppercase text-slate-500 font-semibold">Current State</div>
            <div className="text-sm font-bold text-amber-700 mt-0.5">{multiplayerSession.status}</div>
          </div>
        </div>
      </div>

      {/* Role Assignment & Participant Presence Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <Users className="w-4 h-4 text-sky-600" />
            <span>Participant Presence & Assigned Roles</span>
          </h2>
          <button
            onClick={() => setShowJoinModal(true)}
            className="text-xs px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Join / Switch Role</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {allRoles.map(item => {
            const participant = multiplayerSession.participants.find(p => p.role === item.role);
            const isAssigned = !!participant;
            const isConnected = participant?.status === 'CONNECTED';

            return (
              <div
                key={item.role}
                className={`bg-white border rounded-xl p-4 space-y-3 transition-all ${
                  isAssigned 
                    ? isConnected ? 'border-slate-200 shadow-xs' : 'border-amber-200 bg-amber-50/50'
                    : 'border-dashed border-slate-200 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                    <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                      {item.role.replace('_', ' ')}
                    </span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    isConnected 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : isAssigned 
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {isConnected ? 'Connected' : isAssigned ? 'Waiting' : 'Open Slot'}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <div className="text-slate-600 font-sans text-xs">
                    {item.title} ({item.domain} Domain)
                  </div>
                  {participant ? (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="text-slate-900 font-semibold">{participant.name}</span>
                        <span className="text-slate-500 ml-2 font-mono">[{participant.callsign}]</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Joined {participant.joinedAt}</span>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 italic">
                      Awaiting participant connection...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lobby Actions Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-2">
          {isInstructor && (
            <button
              onClick={handleCreateNewSession}
              className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Generate New Session Code</span>
            </button>
          )}
          <button
            onClick={handleCopyCode}
            className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-2xs"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Session Code</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleStartExercise}
            className="px-6 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-2 shadow-xs transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Exercise</span>
          </button>
        </div>
      </div>

      {/* Join Role Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4 font-mono select-none">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 tracking-wider">
                JOIN EXERCISE SESSION
              </h3>
              <p className="text-xs text-slate-600 font-sans mt-0.5">
                Enter your participant profile and select your exercise role.
              </p>
            </div>

            <form onSubmit={handleJoinSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] text-slate-700 mb-1 font-semibold">
                  Session Code:
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. M7K-42Q"
                  required
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono tracking-widest uppercase focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 mb-1 font-semibold">
                  Participant Full Name:
                </label>
                <input
                  type="text"
                  value={joinName}
                  onChange={e => setJoinName(e.target.value)}
                  placeholder="Capt. Jonathan Thorne"
                  required
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-sans focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 mb-1 font-semibold">
                  Tactical Callsign:
                </label>
                <input
                  type="text"
                  value={joinCallsign}
                  onChange={e => setJoinCallsign(e.target.value)}
                  placeholder="ALPHA-ACTUAL"
                  required
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 mb-1 font-semibold">
                  Assigned Sub-Unit Role:
                </label>
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value as UserRole)}
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono focus:outline-none focus:border-sky-500"
                >
                  <option value="COMMANDER">Sub-Unit Commander (Command)</option>
                  <option value="GROUND_OBSERVER">Ground Recon Observer (Land)</option>
                  <option value="AIR_OBSERVER">Aerial Sensor Controller (Air)</option>
                  <option value="NETWORK_OBSERVER">Network & Sensor Analyst (Cyber)</option>
                  <option value="OBSERVER">Observer / Evaluator (Read-Only)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Confirm & Join Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
