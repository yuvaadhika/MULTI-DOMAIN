import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Radio, 
  Layers, 
  Clock, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Sliders, 
  Send, 
  RotateCcw,
  ExternalLink,
  Table,
  Check,
  X,
  Play,
  Pause,
  Cpu,
  Database,
  GitBranch,
  Info,
  Filter,
  Network,
  Compass,
  Award,
  FileText
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationStore';
import { EVENT_LIBRARY_TEMPLATES, SEED_USERS, SEED_REALITY_LENS_COMPARISONS, SEED_DECISION_RECEIPTS, SEED_INTENT_CARD, SEED_COMMUNICATION_TRACE_PACKETS, SEED_RESILIENCE_SCORE } from '../../data/seedData';
import { DecisionRecord, EventInjectionTemplate, InformationReport, UserRole, DecisionReceipt } from '../../types/simulation';
import { DecisionContextModal } from './DecisionContextModal';
import { InformationProvenanceDrawer } from '../../components/InformationProvenanceDrawer';
import { RealityLensModal } from '../../components/RealityLensModal';
import { CommunicationTraceView } from '../simulation/CommunicationTraceView';
import { IntentCardPanel } from '../simulation/IntentCardPanel';
import { ResilienceScoreBreakdown } from '../aar/ResilienceScoreBreakdown';
import { DecisionReceiptModal } from '../../components/DecisionReceiptModal';

export const InstructorDashboard: React.FC = () => {
  const { 
    session, 
    injectEvent, 
    restoreChannels, 
    setChannelDelay, 
    setChannelDropout, 
    triggerConflictReport,
    sendMessage,
    formatSimTime,
    uncertaintyMetrics,
    informationDebt,
    isPlaying,
    startSimulation,
    pauseSimulation,
    setSelectedProvenanceReport
  } = useSimulation();

  const [selectedDecision, setSelectedDecision] = useState<DecisionRecord | null>(null);
  const [selectedAuditReport, setSelectedAuditReport] = useState<InformationReport | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<DecisionReceipt | null>(null);
  const [customBroadcast, setCustomBroadcast] = useState('');
  const [activeTab, setActiveTab] = useState<
    'ASYMMETRY' | 'TIMELINE' | 'PARTICIPANTS' | 'INJECTIONS' | 'DECISIONS' | 'REALITY_LENS' | 'COMMS_TRACE' | 'INTENT_CARD' | 'RESILIENCE'
  >('ASYMMETRY');

  
  // Event preview modal state
  const [previewTemplate, setPreviewTemplate] = useState<EventInjectionTemplate | null>(null);
  const [previewCustomDelay, setPreviewCustomDelay] = useState<number>(45);

  // Timeline filter
  const [timelineFilter, setTimelineFilter] = useState<'ALL' | 'DECISION' | 'DEGRADATION' | 'REPORT' | 'MESSAGE'>('ALL');

  // Asymmetry cell audit state
  const [cellAudit, setCellAudit] = useState<{ report: InformationReport; role: UserRole; hasAccess: boolean } | null>(null);

  const participants = session.participants;
  const matrixReports = session.reports.slice(0, 8);

  const handleCustomBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customBroadcast.trim()) return;
    sendMessage(`[INSTRUCTOR DIRECTIVE]: ${customBroadcast.trim()}`, 'BROADCAST');
    setCustomBroadcast('');
  };

  const handleConfirmInjection = () => {
    if (!previewTemplate) return;
    injectEvent(previewTemplate, { delaySec: previewCustomDelay });
    setPreviewTemplate(null);
  };

  // Filter logs for central timeline
  const filteredLogs = session.logs.filter(l => {
    if (timelineFilter === 'ALL') return true;
    if (timelineFilter === 'DECISION') return l.type === 'DECISION_SUBMITTED';
    if (timelineFilter === 'DEGRADATION') return l.type === 'COMMUNICATION_DEGRADED' || l.type === 'COMMUNICATION_RESTORED' || l.type === 'INSTRUCTOR_INJECTION';
    if (timelineFilter === 'REPORT') return l.type === 'REPORT_DELIVERED' || l.type === 'CONFLICT_GENERATED';
    if (timelineFilter === 'MESSAGE') return l.type === 'MESSAGE_SENT';
    return true;
  });

  const lastDecision = session.decisions[0];
  const lastDecisionSecondsAgo = lastDecision ? Math.max(0, session.simulationSec - lastDecision.simulationSec) : null;

  const degradedChannelsCount = session.channels.filter(c => c.status !== 'NORMAL').length;
  const infoHealthPercent = Math.max(10, 100 - (degradedChannelsCount * 22 + (uncertaintyMetrics.conflictingReports * 15)));

  return (
    <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-4 font-mono select-none bg-[#f8fafc] text-slate-900">
      {/* Top Banner: Live Exercise Control Room HUD */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-wide">
                  LIVE EXERCISE CONTROL ROOM
                </h1>
                <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded font-semibold uppercase">
                  INSTRUCTOR C2
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  session.status === 'RUNNING' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {session.status}
                </span>
              </div>
              <div className="text-xs text-slate-600 font-sans mt-0.5">
                Exercise: <strong className="text-sky-700 font-mono">{session.scenarioName}</strong> • Region: <strong className="text-slate-900">Meridian Training Area</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={isPlaying ? pauseSimulation : startSimulation}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                isPlaying 
                  ? 'bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800' 
                  : 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? 'Pause Sim' : 'Resume Sim'}</span>
            </button>

            <button
              onClick={restoreChannels}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Baseline Comms</span>
            </button>
          </div>
        </div>

        {/* Live Exercise Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-1">
          <div className="bg-[#f8fafc] p-2.5 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Simulation Clock</div>
            <div className="text-sm sm:text-base font-bold text-slate-900 font-mono">T+{formatSimTime(session.simulationSec)}</div>
          </div>

          <div className="bg-[#f8fafc] p-2.5 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Participants</div>
            <div className="text-sm sm:text-base font-bold text-slate-900">{participants.length} Active</div>
          </div>

          <div className="bg-[#f8fafc] p-2.5 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Information Health</div>
            <div className="text-sm sm:text-base font-bold text-emerald-700">{infoHealthPercent}%</div>
          </div>

          <div className="bg-[#f8fafc] p-2.5 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Communication</div>
            <div className={`text-sm sm:text-base font-bold ${
              degradedChannelsCount > 0 ? 'text-amber-700' : 'text-emerald-700'
            }`}>
              {degradedChannelsCount > 0 ? 'DEGRADED' : 'NORMAL'}
            </div>
          </div>

          <div className="bg-[#f8fafc] p-2.5 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Uncertainty</div>
            <div className={`text-sm sm:text-base font-bold ${
              uncertaintyMetrics.score > 60 ? 'text-rose-700' : uncertaintyMetrics.score > 35 ? 'text-amber-700' : 'text-emerald-700'
            }`}>
              {uncertaintyMetrics.level}
            </div>
          </div>

          <div className="bg-[#f8fafc] p-2.5 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Information Debt</div>
            <div className="text-sm sm:text-base font-bold text-amber-700">{informationDebt.current} pts</div>
          </div>

          <div className="bg-[#f8fafc] p-2.5 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Decisions Logged</div>
            <div className="text-sm sm:text-base font-bold text-sky-700">{session.decisions.length}</div>
          </div>

          <div className="bg-[#f8fafc] p-2.5 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Last Decision</div>
            <div className="text-sm sm:text-base font-bold text-slate-800">
              {lastDecisionSecondsAgo !== null ? `${lastDecisionSecondsAgo}s ago` : 'None'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Instructor sub-sections */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('ASYMMETRY')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'ASYMMETRY'
              ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Asymmetry Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('REALITY_LENS')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'REALITY_LENS'
              ? 'bg-sky-50 text-sky-700 border border-sky-200 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Reality Lens (3-Way)</span>
        </button>

        <button
          onClick={() => setActiveTab('COMMS_TRACE')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'COMMS_TRACE'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Comms Trace</span>
        </button>

        <button
          onClick={() => setActiveTab('INTENT_CARD')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'INTENT_CARD'
              ? 'bg-amber-50 text-amber-700 border border-amber-200 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Intent Card</span>
        </button>

        <button
          onClick={() => setActiveTab('RESILIENCE')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'RESILIENCE'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Resilience Score</span>
        </button>

        <button
          onClick={() => setActiveTab('TIMELINE')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'TIMELINE'
              ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Timeline ({session.logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('INJECTIONS')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'INJECTIONS'
              ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Injections</span>
        </button>

        <button
          onClick={() => setActiveTab('DECISIONS')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'DECISIONS'
              ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Decisions ({session.decisions.length})</span>
        </button>
      </div>

      {/* TAB 1: Information Asymmetry Matrix */}
      {activeTab === 'ASYMMETRY' && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3.5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Live Information Asymmetry Matrix
              </h2>
              <p className="text-[11px] text-slate-600 font-sans mt-0.5">
                Displays information access across participant roles. Click any cell to inspect delivery timing, latency buffers, and decision impact.
              </p>
            </div>
            <span className="text-[10px] px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-semibold">
              Interactive Inspector Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase font-mono bg-[#f8fafc]">
                  <th className="py-2.5 px-3 rounded-l-lg">Report Ingest / Time</th>
                  <th className="py-2.5 px-3">Intelligence Summary</th>
                  <th className="py-2.5 px-3">Domain</th>
                  <th className="py-2.5 px-2 text-center">Commander</th>
                  <th className="py-2.5 px-2 text-center">Ground Recon</th>
                  <th className="py-2.5 px-2 text-center">Air Watch</th>
                  <th className="py-2.5 px-2 text-center rounded-r-lg">Network / Sensor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {matrixReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-mono text-xs">
                      No reports generated yet. Advance the exercise simulation to populate live matrix.
                    </td>
                  </tr>
                ) : (
                  matrixReports.map(rep => {
                    const hasCommander = rep.allowedRoles.includes('COMMANDER');
                    const hasGround = rep.allowedRoles.includes('GROUND_OBSERVER');
                    const hasAir = rep.allowedRoles.includes('AIR_OBSERVER');
                    const hasNetwork = rep.allowedRoles.includes('NETWORK_OBSERVER');

                    return (
                      <tr key={rep.id} className="hover:bg-[#f8fafc] transition-colors text-xs">
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          <div className="font-bold text-sky-700">T+{rep.timestamp}</div>
                          <button
                            onClick={() => setSelectedAuditReport(rep)}
                            className="text-[10px] text-sky-700 hover:underline flex items-center space-x-1 mt-0.5"
                          >
                            <span>Provenance</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        </td>
                        <td className="py-3 px-3 text-slate-800 text-xs max-w-md">
                          <div className="font-semibold text-[11px] text-slate-900 font-mono mb-0.5">{rep.sourceName}</div>
                          <div className="line-clamp-2 text-slate-600 text-[11px]">{rep.content}</div>
                        </td>
                        <td className="py-3 px-3 font-mono whitespace-nowrap">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md ${
                            rep.domain === 'LAND' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            rep.domain === 'AIR' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                            rep.domain === 'CYBER' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {rep.domain}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center font-mono">
                          <button
                            onClick={() => setCellAudit({ report: rep, role: 'COMMANDER', hasAccess: hasCommander })}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all transform hover:scale-105 ${
                              hasCommander ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {hasCommander ? 'YES' : 'NO'}
                          </button>
                        </td>
                        <td className="py-3 px-2 text-center font-mono">
                          <button
                            onClick={() => setCellAudit({ report: rep, role: 'GROUND_OBSERVER', hasAccess: hasGround })}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all transform hover:scale-105 ${
                              hasGround ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {hasGround ? 'YES' : 'NO'}
                          </button>
                        </td>
                        <td className="py-3 px-2 text-center font-mono">
                          <button
                            onClick={() => setCellAudit({ report: rep, role: 'AIR_OBSERVER', hasAccess: hasAir })}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all transform hover:scale-105 ${
                              hasAir ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {hasAir ? 'YES' : 'NO'}
                          </button>
                        </td>
                        <td className="py-3 px-2 text-center font-mono">
                          <button
                            onClick={() => setCellAudit({ report: rep, role: 'NETWORK_OBSERVER', hasAccess: hasNetwork })}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all transform hover:scale-105 ${
                              hasNetwork ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {hasNetwork ? 'YES' : 'NO'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Central Event Timeline */}
      {activeTab === 'TIMELINE' && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3.5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-sky-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Central Event & Ingestion Timeline
              </h2>
            </div>

            <div className="flex items-center space-x-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              {(['ALL', 'DECISION', 'DEGRADATION', 'REPORT', 'MESSAGE'] as const).map(flt => (
                <button
                  key={flt}
                  onClick={() => setTimelineFilter(flt)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                    timelineFilter === flt
                      ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {flt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredLogs.map(log => (
              <div
                key={log.id}
                className="p-3 bg-[#f8fafc] border border-slate-200 rounded-xl flex items-start justify-between text-xs space-x-3 shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-700 font-bold">T+{log.timestamp}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                      log.type === 'DECISION_SUBMITTED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      log.type === 'CONFLICT_GENERATED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      log.type === 'COMMUNICATION_DEGRADED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      log.type === 'COMMUNICATION_RESTORED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {log.type.replace('_', ' ')}
                    </span>
                    <span className="text-slate-500 text-[10px]">Source: {log.source}</span>
                  </div>
                  <p className="text-slate-700 font-sans text-xs">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Event Injections & Preview */}
      {activeTab === 'INJECTIONS' && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Event Injections & Degradation Control</span>
            </h2>
            <p className="text-[11px] text-slate-600 font-sans mt-0.5">
              Select an operational disruption template. Preview its target channels, duration, and simulated impact before injecting into the live exercise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {EVENT_LIBRARY_TEMPLATES.map(tpl => (
              <div
                key={tpl.id}
                className="bg-[#f8fafc] border border-slate-200 hover:border-slate-300 p-4 rounded-xl space-y-3 transition-colors flex flex-col justify-between shadow-2xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md ${
                      tpl.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      tpl.severity === 'HIGH' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-sky-50 text-sky-700 border border-sky-200'
                    }`}>
                      {tpl.category}
                    </span>
                    <span className="text-[10px] text-slate-500">Duration: {tpl.durationSec}s</span>
                  </div>
                  <h3 className="font-bold text-xs text-slate-900">{tpl.name}</h3>
                  <p className="text-slate-600 font-sans text-xs line-clamp-2">{tpl.description}</p>
                </div>

                <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Target: {tpl.affectedChannel}</span>
                  <button
                    onClick={() => {
                      setPreviewTemplate(tpl);
                      setPreviewCustomDelay(tpl.defaultDelaySec || 45);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center space-x-1 transition-colors"
                  >
                    <span>Preview & Inject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Participant Monitoring Grid */}
      {activeTab === 'PARTICIPANTS' && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-2">
              <Users className="w-4 h-4 text-sky-600" />
              <span>Participant Telemetry & Role State</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {participants.map(p => (
              <div key={p.id} className="bg-[#f8fafc] border border-slate-200 p-4 rounded-xl space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-900">{p.name}</div>
                  <span className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-bold">
                    {p.role}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 pt-1">
                  <div>Callsign: <strong className="text-slate-900">{p.callsign}</strong></div>
                  <div>Domain: <strong className="text-slate-900">{p.domain}</strong></div>
                  <div>Status: <strong className="text-emerald-700">{p.status}</strong></div>
                  <div>Team: <strong className="text-slate-900">{p.teamId}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Decisions & Context Snapshots */}
      {activeTab === 'DECISIONS' && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>Logged Decisions & Situational Context Snapshots</span>
            </h2>
          </div>

          <div className="space-y-2.5">
            {session.decisions.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No decisions recorded in current exercise yet.
              </div>
            ) : (
              session.decisions.map(dec => (
                <div
                  key={dec.id}
                  className="p-3.5 bg-[#f8fafc] border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sky-700">T+{dec.timestamp}</span>
                      <span className="text-slate-900 font-semibold">{dec.action}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md">
                        Confidence: {dec.confidence}
                      </span>
                    </div>
                    <p className="text-slate-600 font-sans text-xs italic line-clamp-1">"{dec.rationale}"</p>
                  </div>

                  <button
                    onClick={() => setSelectedDecision(dec)}
                    className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Context & Graph</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: Reality Lens (3-Way Triangulation) */}
      {activeTab === 'REALITY_LENS' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h2 className="text-xs font-bold text-sky-700 uppercase tracking-wide flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>Signature Innovation: Reality Lens 3-Way Triangulation View</span>
                </h2>
                <p className="text-[11px] text-slate-600 font-sans mt-0.5">
                  Instructor master view comparing Ground Truth (Master Engine) vs Team Intel vs Individual Trainee Perception.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SEED_REALITY_LENS_COMPARISONS.map((comp) => (
                <div key={comp.id} className="bg-[#f8fafc] border border-slate-200 p-4 rounded-xl space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-sky-700">T+{comp.timestamp} • {comp.sector}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                      {comp.teamKnowledge.asymmetryLevel} ASYMMETRY
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">{comp.subject}</h3>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                      <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">1. Ground Truth</span>
                      <p className="text-emerald-950 text-[11px] mt-0.5 font-sans">{comp.groundTruth.details}</p>
                    </div>

                    <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-lg">
                      <span className="text-[10px] font-mono font-bold text-sky-800 uppercase block">2. Trainee Perceived Situation</span>
                      <p className="text-sky-950 text-[11px] mt-0.5 font-sans">"{comp.individualKnowledge.perceivedSituation}"</p>
                    </div>

                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
                      <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">3. Why Decision Was Made</span>
                      <p className="text-amber-950 text-[11px] mt-0.5 font-sans">{comp.decisionRationaleBridge.cognitiveDistortionFactor}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: Communication Trace */}
      {activeTab === 'COMMS_TRACE' && (
        <CommunicationTraceView packets={SEED_COMMUNICATION_TRACE_PACKETS} />
      )}

      {/* TAB: Intent Card Protocol */}
      {activeTab === 'INTENT_CARD' && (
        <IntentCardPanel intentCard={SEED_INTENT_CARD} />
      )}

      {/* TAB: Operational Resilience Scorecard */}
      {activeTab === 'RESILIENCE' && (
        <ResilienceScoreBreakdown metrics={SEED_RESILIENCE_SCORE} />
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <form onSubmit={handleCustomBroadcast} className="flex items-center space-x-2">
          <Send className="w-4 h-4 text-sky-600 shrink-0" />
          <input
            type="text"
            value={customBroadcast}
            onChange={e => setCustomBroadcast(e.target.value)}
            placeholder="Transmit real-time instructor directive or exercise constraint change to all participant nets..."
            className="flex-1 bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 font-sans"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
          >
            Broadcast
          </button>
        </form>
      </div>

      {/* Event Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 font-mono select-none">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-bold uppercase">
                  EVENT INJECTION PREVIEW
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1.5">{previewTemplate.name}</h3>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#f8fafc] p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Affected Channels:</div>
                <div className="text-sky-700 font-bold">{previewTemplate.affectedChannel} ({previewTemplate.domain} Domain)</div>
              </div>

              <div className="bg-[#f8fafc] p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Simulated Operational Impact:</div>
                <p className="text-slate-700 font-sans text-xs leading-relaxed">{previewTemplate.impactPreview}</p>
              </div>

              {previewTemplate.category === 'DELAY' && (
                <div>
                  <label className="block text-[11px] text-slate-700 mb-1 font-semibold">
                    Latency Buffer (Seconds):
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={180}
                    value={previewCustomDelay}
                    onChange={e => setPreviewCustomDelay(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmInjection}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors shadow-xs"
              >
                Inject Event Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Asymmetry Cell Audit Modal */}
      {cellAudit && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 font-mono select-none">
            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 border border-sky-200 font-bold uppercase">
                  ASYMMETRY CELL AUDIT
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1.5">Role: {cellAudit.role}</h3>
              </div>
              <button onClick={() => setCellAudit(null)} className="p-1 text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-[#f8fafc] rounded-xl border border-slate-200 space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Report Content</div>
                <p className="text-slate-700 font-sans text-xs leading-relaxed">{cellAudit.report.content}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="p-2.5 bg-[#f8fafc] rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500">Access Granted:</div>
                  <div className={`font-bold ${cellAudit.hasAccess ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {cellAudit.hasAccess ? 'YES (Delivered)' : 'NO (Withheld)'}
                  </div>
                </div>

                <div className="p-2.5 bg-[#f8fafc] rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500">Latency Buffer:</div>
                  <div className="font-bold text-slate-800">
                    {cellAudit.report.provenance?.latencySec ? `${cellAudit.report.provenance.latencySec}s delay` : '0s (Direct)'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setCellAudit(null)}
                className="px-4 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decision Context Modal */}
      {selectedDecision && (
        <DecisionContextModal
          decision={selectedDecision}
          onClose={() => setSelectedDecision(null)}
        />
      )}

      {/* Information Provenance Drawer */}
      <InformationProvenanceDrawer
        report={selectedAuditReport}
        onClose={() => setSelectedAuditReport(null)}
      />
    </div>
  );
};
