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
  Network,
  Box
} from 'lucide-react';
import { useSimulation } from '../simulation/simulationStore';
import { SEED_USERS } from '../data/seedData';
import { UserRole } from '../types/simulation';
import { RealityLensModal } from './RealityLensModal';
import { IntentCardPanel } from '../features/simulation/IntentCardPanel';
import { CommunicationTraceView } from '../features/simulation/CommunicationTraceView';
import { OneArcSyntheticEnvironment3D } from '../features/simulation/OneArcSyntheticEnvironment3D';

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
    uncertaintyMetrics
  } = useSimulation();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [isRealityLensOpen, setIsRealityLensOpen] = useState(false);
  const [isTraceOpen, setIsTraceOpen] = useState(false);
  const [isIntentOpen, setIsIntentOpen] = useState(false);
  const [isOneArc3DOpen, setIsOneArc3DOpen] = useState(false);

  // Active channel status summaries
  const channelStates = session.channels;
  const delayedCount = channelStates.filter(c => c.status === 'DELAYED').length;
  const interruptedCount = channelStates.filter(c => c.status === 'INTERRUPTED').length;

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'INSTRUCTOR':
        return <span className="px-1.5 py-0.5 text-[9px] rounded font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">INSTRUCTOR</span>;
      case 'COMMANDER':
        return <span className="px-1.5 py-0.5 text-[9px] rounded font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">COMMANDER</span>;
      case 'GROUND_OBSERVER':
        return <span className="px-1.5 py-0.5 text-[9px] rounded font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">GROUND RECON</span>;
      case 'AIR_OBSERVER':
        return <span className="px-1.5 py-0.5 text-[9px] rounded font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">AIR OBSERVER</span>;
      case 'NETWORK_OBSERVER':
        return <span className="px-1.5 py-0.5 text-[9px] rounded font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">CYBER/EW</span>;
    }
  };

  return (
    <header className="h-14 bg-white border-b border-[#e2e8f0] px-3 sm:px-4 flex items-center justify-between font-mono select-none z-30 shrink-0 shadow-xs text-slate-800">
      {/* Left: Brand Identity & Active Scenario Badge */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Brand */}
        <div 
          onClick={() => setCurrentView('LANDING')}
          className="flex items-center space-x-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center font-black text-white text-sm shadow-xs group-hover:bg-sky-700 transition-all">
            SX
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-bold tracking-wider text-slate-900 group-hover:text-sky-700 transition-colors">
              SENTINEL-X
            </div>
            <div className="text-[9px] text-slate-500 tracking-tight">
              WYNDRA LABS
            </div>
          </div>
        </div>

        {/* Active Scenario Codename Pill */}
        <div className="hidden md:flex items-center space-x-1.5 bg-[#f1f5f9] border border-[#e2e8f0] px-2.5 py-1 rounded-lg text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          <span className="text-[11px] font-bold text-slate-900">{session.scenarioName}</span>
          <span className="text-[10px] text-sky-700 font-semibold uppercase">[{session.scenarioId}]</span>
        </div>

        {/* Active Comms Degradation Live Badges */}
        {(delayedCount > 0 || interruptedCount > 0) && (
          <div className="flex items-center space-x-1 text-[10px]">
            {delayedCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                <span>{delayedCount} DELAYED</span>
              </span>
            )}
            {interruptedCount > 0 && (
              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                <span>{interruptedCount} BLACKOUT</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Center: Live Exercise Simulation Clock & Playback Transport */}
      <div className="flex items-center space-x-2 sm:space-x-3 bg-[#f8fafc] border border-[#e2e8f0] px-2 sm:px-3 py-1 rounded-xl shadow-xs">
        {/* Live Elapsed Time */}
        <div className="flex items-center space-x-1.5 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-sky-600" />
          <span className="text-[10px] text-slate-500 font-semibold">T+</span>
          <span className="font-bold text-slate-900 text-sm tracking-wider">
            {formatSimTime(session.simulationSec)}
          </span>
        </div>

        <div className="h-4 w-px bg-[#e2e8f0] hidden sm:block" />

        {/* Simulation Playback Controls */}
        <div className="flex items-center space-x-1">
          {isPlaying ? (
            <button
              onClick={pauseSimulation}
              title="Pause Simulation"
              className="p-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={startSimulation}
              title="Start / Resume Exercise"
              className="p-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          <button
            onClick={resetSimulation}
            title="Reset Exercise Scenario"
            className="p-1 rounded-md bg-[#f1f5f9] hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-[#e2e8f0] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed Multiplier Pill */}
        <div className="hidden lg:flex items-center space-x-0.5 bg-white border border-[#e2e8f0] rounded-md p-0.5 text-[10px]">
          {([1, 2, 4] as const).map(speed => (
            <button
              key={speed}
              onClick={() => setSimSpeed(speed)}
              className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                simSpeed === speed 
                  ? 'bg-sky-600 text-white' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {currentUser.role === 'INSTRUCTOR' && (
          <button
            onClick={endSimulation}
            className="hidden sm:inline px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold transition-colors"
            title="Terminate Active Exercise & Generate Final AAR Report"
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
            onClick={() => setIsOneArc3DOpen(true)}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs rounded-md text-sky-800 bg-sky-100 hover:bg-sky-200 transition-colors font-bold shadow-xs border border-sky-300"
            title="Open 3D OneArc Synthetic Environment (UAV & Terrain)"
          >
            <Box className="w-3.5 h-3.5 text-sky-700" />
            <span>3D OneArc</span>
          </button>

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

      {/* OneArc 3D Synthetic Environment Modal */}
      {isOneArc3DOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-mono">
          <div className="w-full h-full max-w-7xl max-h-[95vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl bg-white border border-slate-200">
            <OneArcSyntheticEnvironment3D
              isFullscreen={false}
              onFullscreenToggle={() => setIsOneArc3DOpen(false)}
            />
          </div>
        </div>
      )}

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
