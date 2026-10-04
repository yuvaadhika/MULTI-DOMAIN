import React from 'react';
import { 
  BarChart3, 
  Clock, 
  Activity, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Cpu, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  CartesianGrid, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useSimulation } from '../../simulation/simulationStore';
import { HISTORICAL_AAR_SESSION } from '../../data/seedData';

export const AnalyticsDashboard: React.FC = () => {
  const { aarSession } = useSimulation();

  const session = aarSession || HISTORICAL_AAR_SESSION;

  // Decision latency chart data
  const latencyData = session.decisions.map((d, idx) => ({
    name: `D#${idx + 1} (${d.participantRole.slice(0, 5)})`,
    latency: d.decisionLatencySec,
    confidence: d.confidence,
    timestamp: `T+${d.timestamp}`
  }));

  // Communication volume over 1-minute buckets
  const commsVolumeData = [
    { minute: '00:00 - 01:00', messages: 4, reports: 2 },
    { minute: '01:00 - 02:00', messages: 7, reports: 3 },
    { minute: '02:00 - 03:00', messages: 11, reports: 4 },
    { minute: '03:00 - 04:00', messages: 8, reports: 2 },
    { minute: '04:00 - 05:00', messages: 5, reports: 1 }
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 font-mono select-none max-w-6xl mx-auto bg-slate-50 min-h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-sky-600" />
            <span>DECISION ANALYTICS & TELEMETRY DASHBOARD</span>
          </h1>
          <p className="text-xs text-slate-600 font-sans mt-0.5">
            Quantitative analysis of decision latency, uncertainty exposure, and communication dynamics under degradation.
          </p>
        </div>

        <span className="text-[11px] px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg shadow-xs">
          Evaluating: {session.scenarioName}
        </span>
      </div>

      {/* Top Analytical KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Mean Decision Latency</span>
          <span className="text-xl font-bold text-slate-900">
            {Math.round(session.decisions.reduce((acc, d) => acc + d.decisionLatencySec, 0) / (session.decisions.length || 1))}s
          </span>
          <span className="text-[10px] text-slate-500 block font-sans">Time elapsed from event trigger</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Peak Uncertainty Exposure</span>
          <span className="text-xl font-bold text-amber-700">82 / 100</span>
          <span className="text-[10px] text-slate-500 block font-sans">Recorded at T+03:00 RF burst</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Inter-Unit Comms Volume</span>
          <span className="text-xl font-bold text-sky-700">{session.messages.length} Exchanges</span>
          <span className="text-[10px] text-slate-500 block font-sans">Tactical Net & Broadcast</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Decisions Logged</span>
          <span className="text-xl font-bold text-emerald-700">{session.decisions.length} Completed</span>
          <span className="text-[10px] text-slate-500 block font-sans">All accompanied by rationale</span>
        </div>
      </div>

      {/* Primary Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Decision Latency */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold text-slate-900 uppercase">
              Decision Latency per Action (Seconds)
            </span>
            <span className="text-[10px] text-slate-500">Non-prescriptive duration</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#475569', fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#475569', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: any) => [`${val} seconds`, 'Latency']}
                />
                <Bar dataKey="latency" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Communication Volume & Ingestion Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold text-slate-900 uppercase">
              Communication & Report Velocity
            </span>
            <span className="text-[10px] text-slate-500">1-Minute Ingestion Buckets</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={commsVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="minute" stroke="#64748b" tick={{ fill: '#475569', fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#475569', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ fontSize: 10, color: '#475569' }} />
                <Bar dataKey="messages" fill="#0284c7" name="Team Messages" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reports" fill="#10b981" name="Sensor Reports" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Side-by-Side Participant Decision Comparison */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Side-by-Side Participant Decision Comparison
            </h2>
            <p className="text-[11px] text-slate-600 font-sans mt-0.5">
              Compare command actions, reasoning latency, and confidence across participants exposed to identical conditions.
            </p>
          </div>
          <span className="text-[10px] text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md font-semibold">
            Comparative Instructional Analysis
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {session.decisions.slice(0, 2).map((dec, idx) => (
            <div key={dec.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <span className="text-[10px] font-bold text-sky-700 uppercase font-mono">
                    Participant {String.fromCharCode(65 + idx)}
                  </span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {dec.participantName}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Role: {dec.participantRole}
                  </div>
                </div>

                <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                  dec.confidence === 'HIGH' ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' :
                  dec.confidence === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border border-amber-300' :
                  'bg-rose-50 text-rose-700 border border-rose-300'
                }`}>
                  {dec.confidence} Confidence
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 text-[10px] block">Action Selected:</span>
                  <strong className="text-slate-900">{dec.action}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Decision Latency:</span>
                  <strong className="text-sky-700">{dec.decisionLatencySec} seconds</strong>
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] block font-semibold">Captured Rationale:</span>
                <p className="text-slate-700 font-sans text-xs italic pl-2.5 border-l-2 border-sky-500 mt-1">
                  "{dec.rationale}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
