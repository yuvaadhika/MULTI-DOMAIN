import React, { useState } from 'react';
import { 
  Layers, 
  Play, 
  Copy, 
  Edit3, 
  Eye, 
  Clock, 
  Users, 
  ShieldAlert, 
  Check, 
  X,
  Plus
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationStore';
import { ScenarioDefinition } from '../../types/simulation';

export const ScenarioLibrary: React.FC = () => {
  const { scenarios, setActiveScenario, setCurrentView, startSimulation, resetSimulation } = useSimulation();

  const [previewScenario, setPreviewScenario] = useState<ScenarioDefinition | null>(null);

  const handleStartExercise = (scen: ScenarioDefinition) => {
    setActiveScenario(scen);
    resetSimulation();
    startSimulation();
    setCurrentView('LIVE_SIMULATION');
  };

  const handleDuplicate = (scen: ScenarioDefinition) => {
    const duplicated: ScenarioDefinition = {
      ...scen,
      id: `scen-dup-${Date.now()}`,
      name: `${scen.name} (Copy)`,
      codename: `${scen.codename}-COPY`
    };
    setActiveScenario(duplicated);
    setCurrentView('SCENARIO_BUILDER');
  };

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 font-mono select-none max-w-6xl mx-auto bg-slate-50 min-h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-sky-600" />
            <span>EXERCISE SCENARIO REPOSITORY</span>
          </h1>
          <p className="text-xs text-slate-600 font-sans mt-0.5">
            Standardized and research-grade simulation scenarios for degraded communication environments.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('SCENARIO_BUILDER')}
          className="px-3.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Scenario</span>
        </button>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map(scen => (
          <div
            key={scen.id}
            className="bg-white border border-slate-200 hover:border-sky-400 hover:shadow-md rounded-xl p-4 flex flex-col justify-between space-y-4 transition-all shadow-xs"
          >
            <div className="space-y-2.5">
              {/* Header row */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-tight">
                    {scen.name}
                  </h2>
                  <div className="text-[10px] text-sky-600 font-semibold mt-0.5">
                    {scen.codename}
                  </div>
                </div>

                <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase ${
                  scen.difficulty === 'COMPLEX' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                  scen.difficulty === 'ADVANCED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {scen.difficulty}
                </span>
              </div>

              {/* Training Objective */}
              <div className="text-xs text-slate-600 font-sans leading-relaxed line-clamp-3">
                {scen.trainingObjective}
              </div>

              {/* Metadata Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {scen.domains.map(dom => (
                  <span
                    key={dom}
                    className="px-2 py-0.5 text-[9px] font-semibold bg-slate-100 border border-slate-200 text-slate-700 rounded-md"
                  >
                    {dom}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer: Duration & Actions */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{scen.durationMinutes} min</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{scen.participantCount} Participants</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setPreviewScenario(scen)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 font-medium flex items-center justify-center space-x-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Preview</span>
                </button>

                <button
                  onClick={() => handleStartExercise(scen)}
                  className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold flex items-center justify-center space-x-1 transition-colors shadow-xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Start Live</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewScenario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{previewScenario.name}</h3>
                <div className="text-xs text-sky-600 font-mono mt-0.5">{previewScenario.codename}</div>
              </div>
              <button
                onClick={() => setPreviewScenario(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Description</span>
                <p className="text-slate-700 font-sans mt-0.5 leading-relaxed">{previewScenario.description}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Training Objective</span>
                <p className="text-slate-800 font-sans mt-0.5 leading-relaxed">{previewScenario.trainingObjective}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>Duration: <strong className="text-slate-900">{previewScenario.durationMinutes} min</strong></div>
                <div>Difficulty: <strong className="text-slate-900">{previewScenario.difficulty}</strong></div>
                <div>Domains: <strong className="text-sky-700">{previewScenario.domains.join(', ')}</strong></div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                  Scheduled Timeline Injections ({previewScenario.scheduledEvents.length})
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {previewScenario.scheduledEvents.map(e => (
                    <div key={e.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-[11px]">
                      <span className="text-sky-700 font-mono font-semibold">{e.timeFormatted}</span>
                      <span className="text-slate-700 truncate mx-2">{e.title}</span>
                      <span className="text-slate-500 text-[9px] uppercase font-semibold">{e.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => handleDuplicate(previewScenario)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center space-x-1 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Clone & Edit</span>
              </button>

              <button
                onClick={() => {
                  handleStartExercise(previewScenario);
                  setPreviewScenario(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center space-x-1 transition-colors shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Launch Exercise</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
