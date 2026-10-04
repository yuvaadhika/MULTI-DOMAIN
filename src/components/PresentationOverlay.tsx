import React from 'react';
import { 
  Minimize2, 
  Activity, 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Shield, 
  FileText 
} from 'lucide-react';
import { useSimulation } from '../simulation/simulationStore';

export const PresentationOverlay: React.FC = () => {
  const { 
    presentationMode, 
    setPresentationMode, 
    session, 
    isPlaying, 
    startSimulation, 
    pauseSimulation, 
    formatSimTime,
    setChannelDelay,
    setChannelDropout,
    triggerConflictReport,
    submitDecision,
    endSimulation,
    setCurrentView,
    uncertaintyMetrics,
    informationDebt
  } = useSimulation();

  if (!presentationMode) return null;

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 font-mono text-xs select-none z-40 shadow-xs text-slate-800">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 border border-sky-300 font-bold">
          <Activity className="w-3.5 h-3.5 text-sky-600" />
          <span>PRESENTATION HUD</span>
        </div>

        <div className="text-slate-700 font-semibold truncate">
          {session.scenarioName} • Clock: <span className="text-sky-700 font-bold">T+{formatSimTime(session.simulationSec)}</span> • Uncertainty: <span className="text-rose-700 font-bold">{uncertaintyMetrics.score}/100</span> • Debt: <span className="text-amber-700 font-bold">{informationDebt.current} pts</span>
        </div>
      </div>

      {/* Presentation Quick Injection Triggers */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setChannelDelay('ch-air', 45)}
          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 rounded-md font-semibold transition-colors shadow-xs"
        >
          1. Inject Delay (45s)
        </button>

        <button
          onClick={() => triggerConflictReport('src-ground-recon', 'src-air-feed')}
          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 text-indigo-800 rounded-md font-semibold transition-colors shadow-xs"
        >
          2. Inject Contradiction
        </button>

        <button
          onClick={() => submitDecision(
            'Request Cross-Domain Verification & Hold Line',
            'Discrepancy between Ground visual report and Aerial EO sensor. Air feed delayed by 45s. Holding forward transit until secondary seismic telemetry corroborates contact.',
            'MEDIUM'
          )}
          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-md font-semibold transition-colors shadow-xs"
        >
          3. Submit Decision
        </button>

        <button
          onClick={() => {
            endSimulation();
            setCurrentView('AAR_VIEW');
          }}
          className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-700 rounded-md font-semibold transition-colors shadow-xs"
        >
          4. Open AAR & Trace
        </button>

        <button
          onClick={() => setPresentationMode(false)}
          className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
          title="Exit Presentation Mode"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
