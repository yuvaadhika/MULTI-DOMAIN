import React, { useState } from 'react';
import { 
  Zap, 
  Clock, 
  Layers, 
  ShieldAlert, 
  Sliders, 
  Plus, 
  Check, 
  AlertTriangle,
  Play
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationStore';
import { EVENT_LIBRARY_TEMPLATES } from '../../data/seedData';
import { EventInjectionTemplate } from '../../types/simulation';

export const EventLibrary: React.FC = () => {
  const { injectEvent, setCurrentView } = useSimulation();

  const [customDelaySec] = useState<number>(45);
  const [customDurationSec] = useState<number>(60);

  const handleInject = (tpl: EventInjectionTemplate) => {
    injectEvent(tpl, {
      delaySec: customDelaySec,
      durationSec: customDurationSec
    });
  };

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 font-mono select-none max-w-6xl mx-auto bg-slate-50 min-h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-600" />
            <span>DISRUPTION & INJECTION EVENT REPOSITORY</span>
          </h1>
          <p className="text-xs text-slate-600 font-sans mt-0.5">
            Pre-configured electromagnetic disruptions, contradictory sensory reports, and packet throttling templates.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('LIVE_SIMULATION')}
          className="px-3.5 py-2 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Switch to Live Simulation</span>
        </button>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EVENT_LIBRARY_TEMPLATES.map(tpl => (
          <div
            key={tpl.id}
            className="bg-white border border-slate-200 hover:border-sky-400 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all shadow-xs"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">
                    {tpl.name}
                  </h3>
                  <div className="text-[10px] text-sky-700 font-medium mt-0.5 uppercase">
                    Domain: {tpl.domain} • Net: {tpl.affectedChannel}
                  </div>
                </div>

                <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase whitespace-nowrap ${
                  tpl.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                  tpl.severity === 'HIGH' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {tpl.severity}
                </span>
              </div>

              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                {tpl.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-500">
                Duration: {tpl.durationSec}s {tpl.defaultDelaySec ? `| Latency: ${tpl.defaultDelaySec}s` : ''}
              </span>

              <button
                onClick={() => handleInject(tpl)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
              >
                <Zap className="w-3 h-3 text-amber-600" />
                <span>Inject Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
