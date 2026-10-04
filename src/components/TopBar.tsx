import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Radio, 
  Activity, 
  Database, 
  Sliders, 
  ChevronDown, 
  UserCheck, 
  Maximize2, 
  Minimize2, 
  FastForward,
  Layers,
  ShieldAlert,
  Clock,
  Users,
  Eye,
  Compass,
  Network
} from 'lucide-react';
import { useSimulation } from '../simulation/simulationStore';
import { SEED_USERS } from '../data/seedData';
import { UserRole } from '../types/simulation';
import { RealityLensModal } from './RealityLensModal';
import { IntentCardPanel } from '../features/simulation/IntentCardPanel';
import { CommunicationTraceView } from '../features/simulation/CommunicationTraceView';

export const TopBar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    currentUser,
    setCurrentUser,
    presentationMode,
    setPresentationMode,
    session,
    isPlaying,
    simSpeed,
    setSimSpeed,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    endSimulation,
    formatSimTime,
    isDemoRunning,
    demoStep,
    startGuidedDemo,
    advanceDemoStep,
    stopGuidedDemo,
    multiplayerSession
  } = useSimulation();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showSystemStatus, setShowSystemStatus] = useState(false);
  const [isRealityLensOpen, setIsRealityLensOpen] = useState(false);
  const [isIntentOpen, setIsIntentOpen] = useState(false);
  const [isTraceOpen, setIsTraceOpen] = useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'INSTRUCTOR':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">INSTRUCTOR</span>;
      case 'COMMANDER':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-sky-50 text-sky-700 border border-sky-200 rounded">COMMANDER</span>;
      case 'GROUND_OBSERVER':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">GROUND RECON</span>;
      case 'AIR_OBSERVER':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 rounded">AIR WATCH</span>;
      case 'NETWORK_OBSERVER':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded">NETWORK ANALYST</span>;
      case 'OBSERVER':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-300 rounded">EVALUATOR</span>;
    }
  };

  return (
    <header className="min-h-14 border-b border-[#e2e8f0] bg-white/95 backdrop-blur px-3 sm:px-4 flex flex-wrap items-center justify-between select-none z-30 sticky top-0 font-mono gap-2 py-1.5 sm:py-0 shadow-sm text-slate-900">
      {/* Brand & Active Scenario */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={() => setCurrentView('LANDING')}
          className="flex items-center space-x-2.5 text-left group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 group-hover:border-sky-400 transition-colors shadow-sm">
            <Radio className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] text-sky-600 font-bold tracking-widest uppercase">WYNDRA</span>
              <span className="text-slate-300 font-bold">|</span>
              <span className="font-bold tracking-wider text-xs sm:text-sm text-slate-900">SENTINEL-X</span>
            </div>
            <div className="text-[10px] text-slate-500 font-sans truncate max-w-[140px] sm:max-w-[180px] lg:max-w-none">
              {session.scenarioName}
            </div>
          </div>
        </button>

        <div className="h-4 w-[1px] bg-[#e2e8f0] hidden md:block" />

        {/* Multiplayer Session Hub Link */}
        <button
          onClick={() => setCurrentView('SESSION_LOBBY')}
          className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 text-xs rounded-md bg-[#f1f5f9] border border-[#e2e8f0] text-slate-700 hover:text-sky-700 hover:border-sky-300 transition-colors"
        >
          <Users className="w-3.5 h-3.5 text-sky-600" />
          <span className="text-[10px] text-slate-500">Session:</span>
          <span className="font-bold text-sky-700 text-xs">{multiplayerSession.sessionCode || 'M7K-42Q'}</span>
        </button>
      </div>

      {/* Center: Global Simulation Time & Clock Controls */}
      <div className="flex items-center space-x-2 bg-[#f1f5f9] border border-[#e2e8f0] px-2.5 sm:px-3 py-1 rounded-lg">
        <div className="flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5 text-sky-600" />
          <span className="text-slate-500 text-xs">T+</span>
          <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-wider">
            {formatSimTime(session.simulationSec)}
          </span>
        </div>

        <div className="h-4 w-[1px] bg-[#cbd5e1]" />

        <div className="flex items-center space-x-1">
          <button
            onClick={isPlaying ? pauseSimulation : startSimulation}
            title={isPlaying ? 'Pause Simulation' : 'Start / Resume Simulation'}
            className={`p-1 rounded transition-colors ${
              isPlaying 
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>

          <button
            onClick={resetSimulation}
            title="Reset Simulation Clock"
            className="p-1 rounded bg-white hover:bg-slate-200 text-slate-700 border border-[#e2e8f0] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-4 w-[1px] bg-[#cbd5e1]" />

        {/* Speed multipliers */}
        <div className="flex items-center space-x-0.5">
          {([1, 2, 4] as const).map(s => (
            <button
              key={s}
              onClick={() => setSimSpeed(s)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                simSpeed === s ? 'bg-sky-100 text-sky-800 border border-sky-300 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {session.status === 'RUNNING' && (
          <button
            onClick={endSimulation}
            className="ml-1 px-2 py-0.5 text-[10px] font-mono bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 rounded transition-colors"
          >
            End Sim
          </button>
        )}
      </div>


      {/* Right Controls: Innovation Shortcuts, Guided Demo, Role Switcher */}
      <div className="flex items-center space-x-2">
        {/* Quick-Action Innovation Triggers */}
        <div className="hidden xl:flex items-center space-x-1 bg-[#f1f5f9] border border-[#e2e8f0] p-0.5 rounded-lg">
          <button
            onClick={() => setIsRealityLensOpen(true)}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs rounded-md text-sky-700 hover:bg-sky-100 transition-colors font-medium"
            title="Open Reality Lens 3-Way Triangulation"
          >
            <Eye className="w-3.5 h-3.5 text-sky-600" />
            <span>Reality Lens</span>
          </button>

          <button
            onClick={() => setIsIntentOpen(true)}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs rounded-md text-amber-700 hover:bg-amber-100 transition-colors font-medium"
            title="Open Commander's Intent Card"
          >
            <Compass className="w-3.5 h-3.5 text-amber-600" />
            <span>Intent Card</span>
          </button>

          <button
            onClick={() => setIsTraceOpen(true)}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs rounded-md text-indigo-700 hover:bg-indigo-100 transition-colors font-medium"
            title="Open Communication Trace (Wire Tap)"
          >
            <Network className="w-3.5 h-3.5 text-indigo-600" />
            <span>Comms Trace</span>
          </button>
        </div>

        {/* Guided Demo Button */}
        {isDemoRunning ? (
          <div className="flex items-center space-x-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="text-[11px] font-semibold text-amber-800">
              Demo {demoStep}/9
            </span>
            <button
              onClick={advanceDemoStep}
              className="px-2 py-0.5 text-[10px] bg-amber-500 hover:bg-amber-600 text-white rounded font-bold transition-colors"
            >
              Next
            </button>
            <button
              onClick={stopGuidedDemo}
              className="text-[10px] text-amber-700 hover:text-amber-900 font-semibold"
            >
              Stop
            </button>
          </div>
        ) : (
          <button
            onClick={startGuidedDemo}
            className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 text-xs rounded-lg bg-[#f1f5f9] border border-sky-300 text-sky-800 hover:bg-sky-50 transition-all shadow-sm"
          >
            <Activity className="w-3.5 h-3.5 text-sky-600" />
            <span className="font-semibold text-[11px]">Guided Demo</span>
          </button>
        )}

        {/* Presentation Mode Toggle */}
        <button
          onClick={() => setPresentationMode(!presentationMode)}
          title={presentationMode ? 'Exit Presentation Mode' : 'Enter Presentation Mode (Maximized Layout)'}
          className={`p-1.5 rounded-lg border transition-colors ${
            presentationMode 
              ? 'bg-sky-100 text-sky-800 border-sky-300' 
              : 'bg-[#f1f5f9] text-slate-700 border-[#e2e8f0] hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          {presentationMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>

        {/* User / Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-2 px-2.5 py-1 text-xs rounded-lg bg-[#f1f5f9] border border-[#e2e8f0] hover:border-slate-400 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-slate-600" />
            <div className="text-left font-mono hidden md:block">
              <div className="text-slate-900 font-semibold text-[11px] leading-tight truncate max-w-[100px]">
                {currentUser.name}
              </div>
            </div>
            {getRoleBadge(currentUser.role)}
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {showRoleMenu && (
            <div 
              onMouseLeave={() => setShowRoleMenu(false)}
              className="absolute right-0 mt-2 w-72 bg-white border border-[#e2e8f0] rounded-xl shadow-2xl p-2 z-50 text-xs font-mono space-y-1.5"
            >
              <div className="text-[10px] text-slate-500 uppercase font-semibold px-2 py-1 border-b border-[#e2e8f0]">
                Switch Operational Role / View
              </div>

              <div className="text-[9px] text-slate-400 px-2 pt-1 font-semibold uppercase">
                Instructor Console
              </div>
              {SEED_USERS.filter(u => u.role === 'INSTRUCTOR').map(user => (
                <button
                  key={user.id}
                  onClick={() => {
                    setCurrentUser(user);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                    currentUser.id === user.id ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-semibold' : 'hover:bg-[#f1f5f9] text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-900 text-xs">{user.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{user.callsign}</div>
                  </div>
                  {getRoleBadge(user.role)}
                </button>
              ))}

              <div className="text-[9px] text-slate-400 px-2 pt-2 border-t border-[#e2e8f0] font-semibold uppercase">
                Trainee Roles
              </div>
              {SEED_USERS.filter(u => u.role !== 'INSTRUCTOR' && u.teamId === 'TEAM_ALPHA').map(user => (
                <button
                  key={user.id}
                  onClick={() => {
                    setCurrentUser(user);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                    currentUser.id === user.id ? 'bg-sky-50 border border-sky-200 text-sky-900 font-semibold' : 'hover:bg-[#f1f5f9] text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-900 text-xs">{user.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{user.callsign}</div>
                  </div>
                  {getRoleBadge(user.role)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* Innovation 1: Reality Lens Modal */}
      {isRealityLensOpen && (
        <RealityLensModal
          isOpen={true}
          onClose={() => setIsRealityLensOpen(false)}
        />
      )}

      {/* Innovation 3: Communication Trace Modal */}
      {isTraceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in font-mono">
          <div className="w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl">
            <CommunicationTraceView
              onClose={() => setIsTraceOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Innovation 4: Intent Card Modal */}
      {isIntentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in font-mono">
          <div className="w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl">
            <IntentCardPanel
              onClose={() => setIsIntentOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
};
