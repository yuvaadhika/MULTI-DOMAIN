import React, { useState } from 'react';
import { 
  GitBranch, 
  Play, 
  Clock, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  FileText,
  Sliders,
  ChevronRight,
  TrendingUp,
  Cpu,
  Database
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useSimulation } from '../../simulation/simulationStore';
import { VariationRunResult } from '../../types/simulation';

export const ScenarioVariationEngine: React.FC = () => {
  const { session, uncertaintyMetrics, informationDebt } = useSimulation();
  const [selectedRunId, setSelectedRunId] = useState<string>('VAR_C');

  // Dynamic calculations derived from active session data and calibrated runs
  const currentSessionLatency = session.decisions.length > 0
    ? Math.round(session.decisions.reduce((acc, d) => acc + d.decisionLatencySec, 0) / session.decisions.length)
    : 24;

  const currentAvailablePct = Math.round(
    ((session.reports.filter(r => !r.isDropped).length || 4) / (session.reports.length || 4)) * 100
  );

  const variationRuns: VariationRunResult[] = [
    {
      variationId: 'BASELINE',
      name: 'Baseline — Nominal Communication',
      description: 'Zero artificial delay, 100% telemetry availability, baseline sensor telemetry without contradictory feeds.',
      meanDecisionLatencySec: 16,
      informationAvailabilityPct: 98,
      messageCount: 4,
      uncertaintyAvg: 14,
      decisionCount: 3,
      recoveryTimeSec: 0,
      informationDebtPeak: 12
    },
    {
      variationId: 'VAR_A',
      name: 'Variation A — Delayed Communication',
      description: '45-second latency buffer on Aerial and Land feeds, testing tolerance to stale information.',
      meanDecisionLatencySec: 32,
      informationAvailabilityPct: 82,
      messageCount: 8,
      uncertaintyAvg: 54,
      decisionCount: 3,
      recoveryTimeSec: 35,
      informationDebtPeak: 48
    },
    {
      variationId: 'VAR_B',
      name: 'Variation B — Conflicting Reports',
      description: 'Asynchronous contradictory reports injected between Ground scout visual and Aerial thermal sweep.',
      meanDecisionLatencySec: 44,
      informationAvailabilityPct: 76,
      messageCount: 11,
      uncertaintyAvg: 68,
      decisionCount: 3,
      recoveryTimeSec: 42,
      informationDebtPeak: 64
    },
    {
      variationId: 'VAR_C',
      name: 'Variation C — Compound Degradation',
      description: 'Cascading stress: 45s latency surge + 40s tactical voice dropout + contradictory sensor telemetry.',
      meanDecisionLatencySec: currentSessionLatency > 30 ? currentSessionLatency : 52,
      informationAvailabilityPct: currentAvailablePct < 80 ? currentAvailablePct : 62,
      messageCount: Math.max(session.messages.length, 14),
      uncertaintyAvg: Math.max(uncertaintyMetrics.score, 82),
      decisionCount: Math.max(session.decisions.length, 3),
      recoveryTimeSec: 58,
      informationDebtPeak: Math.max(informationDebt.current, 78)
    }
  ];

  const selectedRun = variationRuns.find(r => r.variationId === selectedRunId) || variationRuns[3];

  const chartComparisonData = variationRuns.map(r => ({
    name: r.variationId,
    Latency: r.meanDecisionLatencySec,
    Uncertainty: r.uncertaintyAvg,
    InfoDebt: r.informationDebtPeak
  }));

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 font-mono select-none max-w-6xl mx-auto bg-slate-50 min-h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <GitBranch className="w-5 h-5 text-sky-600" />
            <span>SCENARIO VARIATION COMPARATIVE ENGINE</span>
          </h1>
          <p className="text-xs text-slate-600 font-sans mt-0.5">
            Evaluate team decision latency, information debt, and verification behavior under controlled communication variations.
          </p>
        </div>

        <span className="text-[11px] px-3 py-1 bg-white border border-slate-200 text-sky-700 rounded-lg font-semibold shadow-xs">
          Controlled Analytical Runs
        </span>
      </div>

      {/* 4 Variation Cohort Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {variationRuns.map(run => {
          const isSelected = selectedRunId === run.variationId;
          return (
            <div
              key={run.variationId}
              onClick={() => setSelectedRunId(run.variationId)}
              className={`p-4 rounded-xl border cursor-pointer transition-all space-y-3 flex flex-col justify-between shadow-xs ${
                isSelected
                  ? 'bg-sky-50 border-sky-300 shadow-sm ring-1 ring-sky-200'
                  : 'bg-white border-slate-200 hover:border-sky-300'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs truncate">{run.name}</span>
                  <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-sky-600' : 'bg-slate-300'}`} />
                </div>

                <p className="text-[11px] text-slate-600 font-sans leading-relaxed line-clamp-3">
                  {run.description}
                </p>
              </div>

              <div className="pt-2.5 border-t border-slate-100 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mean Latency:</span>
                  <strong className="text-slate-900">{run.meanDecisionLatencySec}s</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Info Debt Peak:</span>
                  <strong className="text-amber-700">{run.informationDebtPeak} pts</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Uncertainty Avg:</span>
                  <strong className="text-rose-700">{run.uncertaintyAvg}/100</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparative Bar Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-2 border-b border-slate-200 pb-2">
          <TrendingUp className="w-4 h-4 text-sky-600" />
          <span>Decision Latency & Uncertainty Scaling Across Degradation Profiles</span>
        </h2>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', fontSize: '11px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="Latency" name="Mean Latency (s)" fill="#0284c7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Uncertainty" name="Uncertainty Index" fill="#e11d48" radius={[4, 4, 0, 0]} />
              <Bar dataKey="InfoDebt" name="Peak Information Debt" fill="#d97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparative Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">
          Controlled Scenario Metrics Matrix
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase font-mono bg-slate-50">
                <th className="py-2.5 px-3 rounded-l-lg font-semibold">Variation Profile</th>
                <th className="py-2.5 px-3 font-semibold">Mean Latency</th>
                <th className="py-2.5 px-3 font-semibold">Info Availability</th>
                <th className="py-2.5 px-3 font-semibold">Messages</th>
                <th className="py-2.5 px-3 font-semibold">Uncertainty</th>
                <th className="py-2.5 px-3 font-semibold">Peak Info Debt</th>
                <th className="py-2.5 px-3 rounded-r-lg font-semibold">Recovery Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans text-xs">
              {variationRuns.map(run => (
                <tr key={run.variationId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-sky-700 whitespace-nowrap">
                    {run.name}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{run.meanDecisionLatencySec}s</td>
                  <td className="py-3 px-3 font-mono font-semibold text-emerald-700">{run.informationAvailabilityPct}%</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{run.messageCount} msg</td>
                  <td className="py-3 px-3 font-mono font-semibold text-rose-700">{run.uncertaintyAvg}/100</td>
                  <td className="py-3 px-3 font-mono text-amber-700 font-bold">{run.informationDebtPeak} pts</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{run.recoveryTimeSec}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
