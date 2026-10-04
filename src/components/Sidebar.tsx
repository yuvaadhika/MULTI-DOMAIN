import React from 'react';
import { 
  Compass, 
  MonitorPlay, 
  ShieldAlert, 
  Layers, 
  FileText, 
  RotateCcw, 
  BarChart3, 
  Radio, 
  GitBranch, 
  Settings, 
  Terminal,
  Cpu,
  UserCheck,
  Zap,
  Users
} from 'lucide-react';
import { useSimulation, AppView } from '../simulation/simulationStore';

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, currentUser, uncertaintyMetrics, informationDebt, session, multiplayerSession } = useSimulation();

  const isInstructor = currentUser.role === 'INSTRUCTOR';

  const navItems: { view: AppView; label: string; icon: React.ReactNode; instructorOnly?: boolean; badge?: string }[] = [
    { view: 'LANDING', label: 'Platform Overview', icon: <Compass className="w-4 h-4" /> },
    { view: 'SESSION_LOBBY', label: 'Exercise Lobby', icon: <Users className="w-4 h-4" />, badge: multiplayerSession.sessionCode || 'M7K-42Q' },
    { view: 'LIVE_SIMULATION', label: 'Live Simulation', icon: <MonitorPlay className="w-4 h-4" />, badge: session.status === 'RUNNING' ? 'LIVE' : undefined },
    { view: 'INSTRUCTOR_DASHBOARD', label: 'Instructor Control Room', icon: <ShieldAlert className="w-4 h-4" />, instructorOnly: true, badge: 'C2' },
    { view: 'SCENARIO_LIBRARY', label: 'Scenario Library', icon: <Layers className="w-4 h-4" /> },
    { view: 'SCENARIO_BUILDER', label: 'Scenario Builder', icon: <FileText className="w-4 h-4" />, instructorOnly: true },
    { view: 'EVENT_LIBRARY', label: 'Event Library', icon: <Zap className="w-4 h-4" />, instructorOnly: true },
    { view: 'AAR_VIEW', label: 'After Action Review', icon: <FileText className="w-4 h-4" /> },
    { view: 'REPLAY', label: 'Decision Replay', icon: <RotateCcw className="w-4 h-4" /> },
    { view: 'ANALYTICS', label: 'Decision Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { view: 'VARIATION_ENGINE', label: 'Scenario Variations', icon: <GitBranch className="w-4 h-4" />, instructorOnly: true }
  ];

  return (
    <aside className="w-56 lg:w-60 border-r border-[#e2e8f0] bg-white flex flex-col justify-between select-none shrink-0 z-20 font-mono transition-all">
      {/* Navigation Links */}
      <div className="p-3 space-y-4 overflow-y-auto">
        <div>
          <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 px-3 mb-2">
            Operations Workspace
          </div>
          <nav className="space-y-1 text-xs">
            {navItems.map(item => {
              if (item.instructorOnly && !isInstructor) return null;
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => setCurrentView(item.view)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-all text-left ${
                    isActive 
                      ? 'bg-sky-50 text-sky-700 border border-sky-200 font-semibold shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-[#f1f5f9] border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className={isActive ? 'text-sky-600' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold font-mono ${
                      item.badge === 'LIVE' 
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse' 
                        : 'bg-[#f1f5f9] text-slate-600 border border-slate-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Live Uncertainty & Debt Telemetry Box */}
        <div className="bg-[#f8fafc] border border-slate-200 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-sky-600" />
              <span>Uncertainty</span>
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
              uncertaintyMetrics.level === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
              uncertaintyMetrics.level === 'HIGH' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
              uncertaintyMetrics.level === 'MEDIUM' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
              'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {uncertaintyMetrics.level}
            </span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                uncertaintyMetrics.score > 70 ? 'bg-rose-500' :
                uncertaintyMetrics.score > 40 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${uncertaintyMetrics.score}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 pt-1.5 border-t border-slate-200">
            <div>Score: <strong className="text-slate-800">{uncertaintyMetrics.score}/100</strong></div>
            <div>Debt: <strong className="text-amber-600 font-semibold">{informationDebt.current} pts</strong></div>
            <div>Delayed: <strong className="text-slate-800">{uncertaintyMetrics.delayedSources}</strong></div>
            <div>Conflicted: <strong className="text-slate-800">{uncertaintyMetrics.conflictingReports}</strong></div>
          </div>
        </div>
      </div>

      {/* Footer Profile & Callsign */}
      <div className="p-3 border-t border-[#e2e8f0] bg-[#f8fafc] text-xs font-mono">
        <div className="flex items-center justify-between text-[11px] text-slate-800">
          <span className="font-semibold truncate">{currentUser.name}</span>
          <span className="text-[10px] text-sky-700 font-mono">[{currentUser.callsign}]</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">
          Role: <strong className="text-slate-700">{currentUser.role}</strong>
        </div>
      </div>
    </aside>
  );
};
