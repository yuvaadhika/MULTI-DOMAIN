import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  RotateCcw, 
  Clock, 
  Users, 
  ShieldAlert, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  GitBranch, 
  ExternalLink, 
  Filter, 
  Layers,
  Table,
  Check,
  X,
  Printer,
  Cpu,
  Database,
  Eye,
  TrendingUp,
  Radio,
  BookOpen,
  Edit3,
  Award,
  Compass,
  Network,
  Lock,
  Shield
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  CartesianGrid,
  Legend 
} from 'recharts';
import { useSimulation } from '../../simulation/simulationStore';
import { DecisionRecord, ExerciseSession, InformationReport, DecisionReceipt } from '../../types/simulation';
import { DecisionContextModal } from '../instructor/DecisionContextModal';
import { DecisionEvidenceGraph } from '../../components/DecisionEvidenceGraph';
import { InformationProvenanceDrawer } from '../../components/InformationProvenanceDrawer';
import { RealityLensModal } from '../../components/RealityLensModal';
import { DecisionReceiptModal } from '../../components/DecisionReceiptModal';
import { CommunicationTraceView } from '../simulation/CommunicationTraceView';
import { IntentCardPanel } from '../simulation/IntentCardPanel';
import { ResilienceScoreBreakdown } from './ResilienceScoreBreakdown';
import { 
  HISTORICAL_AAR_SESSION, 
  SEED_REALITY_LENS_COMPARISONS, 
  SEED_DECISION_RECEIPTS, 
  SEED_INTENT_CARD, 
  SEED_COMMUNICATION_TRACE_PACKETS, 
  SEED_RESILIENCE_SCORE 
} from '../../data/seedData';

export const AfterActionReview: React.FC = () => {
  const { aarSession, setAarSession, session, setCurrentView, createWhatIfBranch, formatSimTime } = useSimulation();

  const [activeSubTab, setActiveSubTab] = useState<
    'OVERVIEW' | 'REALITY_LENS' | 'DECISION_RECEIPTS' | 'RESILIENCE_SCORE' | 'INTENT_CARD' | 'COMMS_TRACE' | 'ENVIRONMENT' | 'COMMUNICATION' | 'DECISIONS' | 'EVIDENCE' | 'EVOLUTION' | 'CALIBRATION' | 'ROLE_GAP' | 'RECOVERY' | 'NOTES'
  >('OVERVIEW');

  const [selectedDecision, setSelectedDecision] = useState<DecisionRecord | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<DecisionReceipt | null>(null);
  const [isRealityLensModalOpen, setIsRealityLensModalOpen] = useState<boolean>(false);
  const [selectedProvenanceReport, setSelectedProvenanceReport] = useState<InformationReport | null>(null);

  // Instructor Notes state
  const currentAAR = aarSession || HISTORICAL_AAR_SESSION;
  const [notes, setNotes] = useState<string>(
    currentAAR.instructorNotes || 
    'Team demonstrated structured verification protocols during initial 45s latency. When aerial feed contradicted ground observations at T+02:40, Commander appropriately paused forward transit and requested secondary confirmation from Network sensor array rather than acting on single-source unverified feed.'
  );
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Printable Report view
  const [showPrintView, setShowPrintView] = useState(false);

  // Export JSON
  const handleExportJSON = () => {
    const dataToExport = { ...currentAAR, instructorNotes: notes };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `SENTINEL-X_AAR_${currentAAR.sessionCode || currentAAR.id}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export Standard CSV
  const handleExportCSV = () => {
    const headers = ['Decision_ID', 'Timestamp', 'Participant_Name', 'Role', 'Action', 'Confidence', 'Latency_Sec', 'Uncertainty_Index', 'Information_Debt', 'Rationale'];
    const rows = currentAAR.decisions.map(d => [
      d.id,
      d.timestamp,
      `"${d.participantName}"`,
      d.participantRole,
      `"${d.action.replace(/"/g, '""')}"`,
      d.confidence,
      d.decisionLatencySec,
      d.informationEnvironmentState.uncertaintyIndex,
      d.informationEnvironmentState.informationDebt || 0,
      `"${d.rationale.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SENTINEL-X_Decisions_${currentAAR.id}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Export Research Dataset CSV (Standard Schema)
  const handleExportResearchCSV = () => {
    const headers = [
      'Session_ID',
      'Timestamp',
      'Participant',
      'Role',
      'Information_Available_Count',
      'Information_Missing_Count',
      'Communication_State',
      'Active_Events',
      'Decision',
      'Confidence',
      'Decision_Latency_Sec',
      'Information_Debt',
      'Uncertainty_Index',
      'Rationale'
    ];

    const rows = currentAAR.decisions.map(d => {
      const commState = Object.values(d.contextSnapshot?.channelStates || {}).includes('INTERRUPTED')
        ? 'INTERRUPTED'
        : Object.values(d.contextSnapshot?.channelStates || {}).includes('DELAYED')
        ? 'DEGRADED'
        : 'NORMAL';

      const activeEvents = (d.contextSnapshot?.activeEvents || []).join('; ');

      return [
        `"${currentAAR.sessionCode || currentAAR.id}"`,
        `"T+${d.timestamp}"`,
        `"${d.participantName}"`,
        d.participantRole,
        d.contextSnapshot?.informationAvailable?.length || 0,
        d.contextSnapshot?.informationUnavailable?.length || 0,
        commState,
        `"${activeEvents.replace(/"/g, '""')}"`,
        `"${d.action.replace(/"/g, '""')}"`,
        d.confidence,
        d.decisionLatencySec,
        d.informationEnvironmentState.informationDebt || 0,
        d.informationEnvironmentState.uncertaintyIndex,
        `"${d.rationale.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SENTINEL-X_Research_Dataset_${currentAAR.id}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Uncertainty chart data
  const chartData = currentAAR.uncertaintyHistory.map(item => ({
    time: `T+${formatSimTime(item.timeSec)}`,
    uncertainty: item.score,
    debt: item.debt ?? Math.round(item.score * 0.85)
  }));

  // Confidence Calibration Data
  const calibrationData = currentAAR.decisions.map((d, idx) => {
    const isHighConf = d.confidence === 'HIGH';
    const isLowAvailability = (d.contextSnapshot?.informationAvailable?.length || 0) < 3;
    const hasConflict = d.informationEnvironmentState.conflictedReportsCount > 0;
    
    let alignment: 'ALIGNED' | 'OVERCONFIDENT_UNDER_UNCERTAINTY' | 'CAUTIOUS' = 'ALIGNED';
    if (isHighConf && (isLowAvailability || hasConflict)) {
      alignment = 'OVERCONFIDENT_UNDER_UNCERTAINTY';
    } else if (!isHighConf && !hasConflict && !isLowAvailability) {
      alignment = 'CAUTIOUS';
    }

    return {
      id: d.id,
      step: idx + 1,
      action: d.action,
      confidence: d.confidence,
      availability: (d.contextSnapshot?.informationAvailable?.length || 0) > 2 ? 'HIGH' : 'LOW',
      conflict: hasConflict ? 'HIGH' : 'LOW',
      alignment,
      latency: d.decisionLatencySec
    };
  });

  // Decision Evolution Steps
  const evolutionSteps = currentAAR.decisions.map((d, idx) => ({
    stepNumber: idx + 1,
    decisionId: d.id,
    action: d.action,
    rationale: d.rationale,
    timestamp: d.timestamp,
    isReversal: d.isReversal || idx === 1,
    reversalReason: d.reversalReason || (idx === 1 ? 'Shifted posture from holding to active reliance on secondary sensor feeds.' : undefined),
    commsState: idx === 0 ? 'Delayed Air Feed' : idx === 1 ? 'Tactical Voice Dropout' : 'Full Satcom Recovery'
  }));

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 font-mono select-none max-w-6xl mx-auto bg-slate-50 min-h-full">
      {/* Printable Report Overlay */}
      {showPrintView ? (
        <div className="bg-white text-slate-900 p-8 rounded-xl shadow-xl space-y-6 print:m-0 print:p-0 font-sans border border-slate-200">
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
            <div>
              <div className="text-xl font-bold font-mono tracking-wider text-slate-900">
                WYNDRA | SENTINEL-X AFTER ACTION REVIEW
              </div>
              <div className="text-sm text-slate-600 font-mono">
                Immersive Multi-Domain Decision Training & Uncertainty Evaluation Report
              </div>
            </div>
            <div className="text-right font-mono text-xs text-slate-600">
              <div>Session: {currentAAR.sessionCode || currentAAR.id}</div>
              <div>Generated: {new Date().toLocaleString()}</div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 text-xs font-mono bg-slate-100 p-3 rounded-lg border border-slate-200">
            <div><strong>Scenario:</strong> {currentAAR.scenarioName}</div>
            <div><strong>Duration:</strong> {formatSimTime(currentAAR.simulationSec)}</div>
            <div><strong>Decisions Logged:</strong> {currentAAR.decisions.length}</div>
            <div><strong>Participants:</strong> {currentAAR.participants.length}</div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm font-mono border-b border-slate-200 pb-1 text-slate-900">1. DECISION LOG & RATIONALE TRACE</h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-slate-100 font-mono text-[11px] text-slate-700">
                  <th className="p-2 font-semibold">Time</th>
                  <th className="p-2 font-semibold">Role</th>
                  <th className="p-2 font-semibold">Action</th>
                  <th className="p-2 font-semibold">Confidence</th>
                  <th className="p-2 font-semibold">Latency</th>
                  <th className="p-2 font-semibold">Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {currentAAR.decisions.map(d => (
                  <tr key={d.id}>
                    <td className="p-2 font-mono whitespace-nowrap text-sky-700 font-bold">T+{d.timestamp}</td>
                    <td className="p-2 font-mono text-slate-700">{d.participantRole}</td>
                    <td className="p-2 font-bold text-slate-900">{d.action}</td>
                    <td className="p-2 font-semibold text-slate-700">{d.confidence}</td>
                    <td className="p-2 font-mono text-slate-700">{d.decisionLatencySec}s</td>
                    <td className="p-2 text-slate-600 italic">{d.rationale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm font-mono border-b border-slate-200 pb-1 text-slate-900">2. INSTRUCTOR EVALUATION & OBSERVATIONS</h3>
            <p className="text-xs text-slate-800 leading-relaxed font-sans">{notes}</p>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200 print:hidden">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-mono text-xs font-bold"
            >
              Print / Save PDF
            </button>
            <button
              onClick={() => setShowPrintView(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg font-mono text-xs font-semibold"
            >
              Close Print View
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Header Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-300 font-bold uppercase">
                    AFTER ACTION REVIEW
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs text-slate-600">Exercise Session Evaluation</span>
                  <span className="text-xs font-bold text-sky-700 font-mono">[{currentAAR.sessionCode || 'M7K-42Q'}]</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {currentAAR.scenarioName}
                </h1>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowPrintView(true)}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Printable Report</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Decisions CSV</span>
                </button>

                <button
                  onClick={handleExportResearchCSV}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 text-indigo-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
                >
                  <Database className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Research Dataset Export</span>
                </button>

                <button
                  onClick={handleExportJSON}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Full JSON</span>
                </button>

                <button
                  onClick={() => setCurrentView('REPLAY')}
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Launch Decision Replay</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 shadow-xs">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Exercise Duration</div>
                <div className="text-base font-bold text-slate-900">{formatSimTime(currentAAR.simulationSec)}</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 shadow-xs">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Decisions Logged</div>
                <div className="text-base font-bold text-sky-700">{currentAAR.decisions.length} Commits</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 shadow-xs">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Peak Information Debt</div>
                <div className="text-base font-bold text-amber-700">64 pts</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 shadow-xs">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Average Latency</div>
                <div className="text-base font-bold text-emerald-700">23.3 sec</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 shadow-xs">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Adaptation Speed</div>
                <div className="text-base font-bold text-indigo-700">RAPID (15s)</div>
              </div>
            </div>
          </div>

          {/* Structured AAR Navigation Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-semibold">
            {[
              { id: 'OVERVIEW', label: '1. Overview', icon: <BookOpen className="w-3.5 h-3.5" /> },
              { id: 'REALITY_LENS', label: '2. Reality Lens (3-Way)', icon: <Eye className="w-3.5 h-3.5 text-sky-600" /> },
              { id: 'DECISION_RECEIPTS', label: '3. Decision Receipts', icon: <FileText className="w-3.5 h-3.5 text-amber-600" /> },
              { id: 'COMMS_TRACE', label: '4. Comms Trace', icon: <Network className="w-3.5 h-3.5 text-indigo-600" /> },
              { id: 'INTENT_CARD', label: '5. Intent Card Protocol', icon: <Compass className="w-3.5 h-3.5 text-amber-600" /> },
              { id: 'RESILIENCE_SCORE', label: '6. Resilience Score (DSSC)', icon: <Award className="w-3.5 h-3.5 text-emerald-600" /> },
              { id: 'ENVIRONMENT', label: '7. Info Environment', icon: <Cpu className="w-3.5 h-3.5" /> },
              { id: 'COMMUNICATION', label: '8. Comms Analysis', icon: <Radio className="w-3.5 h-3.5" /> },
              { id: 'DECISIONS', label: '9. Decision Timeline', icon: <Clock className="w-3.5 h-3.5" /> },
              { id: 'EVIDENCE', label: '10. Evidence Graphs', icon: <GitBranch className="w-3.5 h-3.5" /> },
              { id: 'EVOLUTION', label: '11. Decision Evolution', icon: <TrendingUp className="w-3.5 h-3.5" /> },
              { id: 'CALIBRATION', label: '12. Confidence Calibration', icon: <Activity className="w-3.5 h-3.5" /> },
              { id: 'ROLE_GAP', label: '13. Role Blindness', icon: <Eye className="w-3.5 h-3.5" /> },
              { id: 'RECOVERY', label: '14. Recovery Intel', icon: <RotateCcw className="w-3.5 h-3.5" /> },
              { id: 'NOTES', label: '15. Instructor Notes', icon: <Edit3 className="w-3.5 h-3.5" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 whitespace-nowrap transition-colors shadow-xs ${
                  activeSubTab === tab.id
                    ? 'bg-sky-50 text-sky-700 border border-sky-300 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* INNOVATION 1: REALITY LENS (3-WAY TRIANGULATION) */}
          {activeSubTab === 'REALITY_LENS' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-sky-600" />
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                        Core Innovation 1: Reality Lens 3-Way Triangulation
                      </h2>
                      <p className="text-xs text-slate-600">
                        What Actually Happened ➔ What the Team Knew ➔ What the Individual Knew ➔ Why the Decision Was Made
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsRealityLensModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-300 text-xs font-bold transition-colors shadow-xs"
                  >
                    Open Interactive Triangulation Matrix
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SEED_REALITY_LENS_COMPARISONS.map((comp) => (
                    <div key={comp.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-sky-700">T+{comp.timestamp} • {comp.sector}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                          {comp.teamKnowledge.asymmetryLevel} ASYMMETRY
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-900">{comp.subject}</h3>

                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 bg-white border border-emerald-300 rounded-lg shadow-xs">
                          <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase block">1. Ground Truth (Physical Reality)</span>
                          <p className="text-slate-700 text-[11px] mt-0.5">{comp.groundTruth.details}</p>
                        </div>

                        <div className="p-2.5 bg-white border border-sky-300 rounded-lg shadow-xs">
                          <span className="text-[10px] font-mono font-bold text-sky-700 uppercase block">2. Trainee Local Feeds ({comp.individualKnowledge.role})</span>
                          <p className="text-slate-700 text-[11px] mt-0.5">"{comp.individualKnowledge.perceivedSituation}"</p>
                        </div>

                        <div className="p-2.5 bg-white border border-amber-300 rounded-lg shadow-xs">
                          <span className="text-[10px] font-mono font-bold text-amber-700 uppercase block">3. Cognitive Bridge / Why Decision Was Made</span>
                          <p className="text-amber-800 text-[11px] mt-0.5">{comp.decisionRationaleBridge.cognitiveDistortionFactor}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* INNOVATION 2: DECISION RECEIPTS & FALLBACK PLANS */}
          {activeSubTab === 'DECISION_RECEIPTS' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-amber-600" />
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                        Core Innovation 2: Decision Receipts & Fallback Plans
                      </h2>
                      <p className="text-xs text-slate-600">
                        Immutable, cryptographically verifiable receipts capturing Action, Rationale, Confidence, and Fallback Plans
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SEED_DECISION_RECEIPTS.map((receipt) => (
                    <div
                      key={receipt.receiptId}
                      onClick={() => setSelectedReceipt(receipt)}
                      className="bg-slate-50 border border-slate-200 hover:border-amber-400 p-4 rounded-xl cursor-pointer space-y-3 transition-all shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-amber-700">{receipt.receiptId}</span>
                        <span className="text-[10px] font-mono text-slate-500">T+{receipt.timestamp} ({receipt.participantRole})</span>
                      </div>

                      <h3 className="text-xs font-bold text-slate-900">{receipt.action}</h3>
                      
                      <p className="text-[11px] text-slate-600 italic font-sans line-clamp-2">
                        "{receipt.primaryRationale}"
                      </p>

                      <div className="p-2.5 bg-white border border-amber-300 rounded-lg shadow-xs">
                        <span className="text-[10px] font-mono font-bold text-amber-700 uppercase block">Designated Fallback Plan</span>
                        <p className="text-[11px] text-slate-800 font-mono line-clamp-2 mt-0.5">{receipt.fallbackPlan}</p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-slate-200 text-slate-500">
                        <span>Confidence: <strong className="text-sky-700 font-semibold">{receipt.confidence}</strong></span>
                        <span className="text-amber-700 font-semibold hover:underline">Click to View Cryptographic Receipt ➔</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* INNOVATION 3: COMMUNICATION TRACE */}
          {activeSubTab === 'COMMS_TRACE' && (
            <CommunicationTraceView packets={SEED_COMMUNICATION_TRACE_PACKETS} />
          )}

          {/* INNOVATION 4: INTENT CARD PROTOCOL */}
          {activeSubTab === 'INTENT_CARD' && (
            <div className="space-y-4">
              <IntentCardPanel intentCard={SEED_INTENT_CARD} />
            </div>
          )}

          {/* INNOVATION 5: RESILIENCE SCORE (DSSC BENCHMARK) */}
          {activeSubTab === 'RESILIENCE_SCORE' && (
            <ResilienceScoreBreakdown metrics={SEED_RESILIENCE_SCORE} />
          )}

          {/* SECTION 1: OVERVIEW */}
          {activeSubTab === 'OVERVIEW' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-2 border-b border-slate-200 pb-2">
                  <BookOpen className="w-4 h-4 text-sky-600" />
                  <span>Exercise Overview & Training Objectives</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 font-mono shadow-xs">
                    <div className="text-[11px] font-bold text-slate-900 uppercase">Scenario Parameters</div>
                    <div className="space-y-1 text-slate-700 text-xs font-mono">
                      <div>Name: <strong className="text-slate-900">{currentAAR.scenarioName}</strong></div>
                      <div>Region: <strong className="text-sky-700">Meridian Training Area</strong></div>
                      <div>Domains: <strong className="text-slate-900">Land, Air, Cyber, EW</strong></div>
                      <div>Active Participants: <strong className="text-slate-900">{currentAAR.participants.length}</strong></div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 shadow-xs">
                    <div className="text-[11px] font-bold text-slate-900 font-mono uppercase">Primary Training Objective</div>
                    <p className="text-slate-700 text-xs leading-relaxed font-sans">
                      Evaluate cross-domain verification protocols, latency tolerance, and adaptation speed when primary observation channels deliver asynchronous contradictory reports.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: INFORMATION ENVIRONMENT (Uncertainty & Debt Timeline) */}
          {activeSubTab === 'ENVIRONMENT' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-sky-600" />
                    <span>Dynamic Information Environment & Debt Progression</span>
                  </h2>
                  <span className="text-[10px] text-slate-500">
                    Calculated from actual channel dropouts, delays, and contradictions
                  </span>
                </div>

                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="uncGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e11d48" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="debtGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d97706" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#d97706" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="time" stroke="#64748b" fontSize={11} tick={{ fill: '#475569' }} />
                      <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} tick={{ fill: '#475569' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: '#475569' }} />
                      <Area type="monotone" dataKey="uncertainty" name="Uncertainty Index" stroke="#e11d48" fill="url(#uncGrad)" />
                      <Area type="monotone" dataKey="debt" name="Information Debt" stroke="#d97706" fill="url(#debtGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* State Phase Flow */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-emerald-700 font-bold block">00:00 - 01:30</span>
                    <span className="font-semibold text-slate-900">Normal Net</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-amber-700 font-bold block">01:30 - 02:40</span>
                    <span className="font-semibold text-slate-900">Degraded (45s Air Lag)</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-amber-700 font-bold block">02:40 - 04:30</span>
                    <span className="font-semibold text-slate-900">Conflicted Feeds</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-emerald-700 font-bold block">04:30 - End</span>
                    <span className="font-semibold text-slate-900">Recovered Net</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: COMMUNICATION ANALYSIS */}
          {activeSubTab === 'COMMUNICATION' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-2 border-b border-slate-200 pb-2">
                  <Radio className="w-4 h-4 text-sky-600" />
                  <span>Communication Channel Degradation & Recovery Audit</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentAAR.channels.map(ch => (
                    <div key={ch.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-xs text-slate-900">{ch.name}</div>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          ch.status === 'NORMAL' ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' :
                          ch.status === 'DELAYED' ? 'bg-amber-50 text-amber-700 border border-amber-300' :
                          'bg-rose-50 text-rose-700 border border-rose-300'
                        }`}>
                          {ch.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                        <div>Domain: <strong className="text-slate-900">{ch.domain}</strong></div>
                        <div>Reliability: <strong className="text-sky-700 font-semibold">{ch.reliabilityScore}%</strong></div>
                        <div>Current Delay: <strong className="text-slate-900">{ch.currentDelaySec}s</strong></div>
                        <div>Last Active: <strong className="text-slate-900">T+{ch.lastActivityTime}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: DECISION TIMELINE & DECISION CONTEXT */}
          {activeSubTab === 'DECISIONS' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Decision Trace & Situational Context Log
                </h2>
                <p className="text-[11px] text-slate-600 font-sans mt-0.5">
                  Step through each submitted action with captured evidence, uncertainty state, and rationale.
                </p>
              </div>

              {currentAAR.decisions.map((dec, idx) => (
                <div key={dec.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-2.5">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-sky-700 border border-slate-200 rounded font-mono">
                          DECISION #{idx + 1}
                        </span>
                        <span className="font-mono text-sky-700 text-xs font-bold">T+{dec.timestamp}</span>
                        <span className="text-slate-600 text-xs font-sans">
                          by <strong className="text-slate-900 font-mono">{dec.participantName}</strong> ({dec.participantRole})
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">{dec.action}</h3>
                    </div>

                    <button
                      onClick={() => setSelectedDecision(dec)}
                      className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Reconstruct Decision Context</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1 shadow-xs">
                      <span className="text-[10px] text-amber-700 font-bold block">CONFIDENCE</span>
                      <span className="text-slate-900 font-bold text-xs">{dec.confidence} Confidence</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1 shadow-xs">
                      <span className="text-[10px] text-sky-700 font-bold block">DECISION LATENCY</span>
                      <span className="text-slate-900 font-bold text-xs">{dec.decisionLatencySec} seconds</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1 shadow-xs">
                      <span className="text-[10px] text-emerald-700 font-bold block">UNCERTAINTY INDEX</span>
                      <span className="text-slate-900 font-bold text-xs">{dec.informationEnvironmentState.uncertaintyIndex}/100</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1 shadow-xs">
                      <span className="text-[10px] text-indigo-700 font-bold block">INFORMATION DEBT</span>
                      <span className="text-slate-900 font-bold text-xs">{dec.informationEnvironmentState.informationDebt || 32} pts</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">Captured Commander Rationale:</span>
                    <p className="text-slate-700 font-sans text-xs italic pl-3 border-l-2 border-sky-500">
                      "{dec.rationale}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SECTION 5: EVIDENCE GRAPHS */}
          {activeSubTab === 'EVIDENCE' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-2 border-b border-slate-200 pb-2">
                  <GitBranch className="w-4 h-4 text-sky-600" />
                  <span>Decision Evidence DAG Graphs</span>
                </h2>

                <div className="space-y-4">
                  {currentAAR.decisions.map((dec) => (
                    <DecisionEvidenceGraph key={dec.id} graph={dec.evidenceGraph} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: DECISION EVOLUTION & ADAPTATION */}
          {activeSubTab === 'EVOLUTION' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-2 border-b border-slate-200 pb-2">
                  <TrendingUp className="w-4 h-4 text-sky-600" />
                  <span>Decision Evolution & Directional Adaptation</span>
                </h2>

                <div className="space-y-3">
                  {evolutionSteps.map((step, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 shadow-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sky-700">Step 0{step.stepNumber}:</span>
                          <span className="font-bold text-slate-900 text-xs">{step.action}</span>
                          <span className="text-slate-500 text-xs">T+{step.timestamp}</span>
                        </div>
                        {step.isReversal && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-300">
                            DECISION ADAPTATION
                          </span>
                        )}
                      </div>

                      <p className="text-slate-700 font-sans text-xs italic">
                        Rationale: "{step.rationale}"
                      </p>

                      <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200 flex items-center justify-between">
                        <span>Trigger: <strong className="text-slate-900">{step.commsState}</strong></span>
                        {step.reversalReason && (
                          <span className="text-indigo-700 font-medium">Adaptation: {step.reversalReason}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: CONFIDENCE–EVIDENCE CALIBRATION */}
          {activeSubTab === 'CALIBRATION' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs overflow-x-auto">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-2 border-b border-slate-200 pb-2">
                  <Activity className="w-4 h-4 text-sky-600" />
                  <span>Confidence–Evidence Alignment & Instructional Calibration</span>
                </h2>

                <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase font-mono bg-slate-50">
                      <th className="p-2 font-semibold">Decision Point</th>
                      <th className="p-2 font-semibold">Action</th>
                      <th className="p-2 font-semibold">Submitted Confidence</th>
                      <th className="p-2 font-semibold">Info Availability</th>
                      <th className="p-2 font-semibold">Source Conflict</th>
                      <th className="p-2 font-semibold">Instructional Alignment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {calibrationData.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono text-sky-700 font-bold">Decision #{c.step}</td>
                        <td className="p-2.5 text-slate-900 font-semibold">{c.action}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.confidence === 'HIGH' ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'bg-amber-50 text-amber-700 border border-amber-300'
                          }`}>
                            {c.confidence}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-800 font-bold">{c.availability}</td>
                        <td className="p-2.5 text-slate-800 font-bold">{c.conflict}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.alignment === 'ALIGNED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'bg-amber-50 text-amber-700 border border-amber-300'
                          }`}>
                            {c.alignment.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 8: ROLE BLINDNESS ANALYSIS */}
          {activeSubTab === 'ROLE_GAP' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-2 border-b border-slate-200 pb-2">
                  <Eye className="w-4 h-4 text-sky-600" />
                  <span>Role Information Gap Analysis (Role Blindness)</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 shadow-xs">
                    <div className="font-bold text-sky-700 text-xs">Commander Domain</div>
                    <p className="text-slate-600 font-sans text-xs leading-relaxed">
                      Received filtered ground reconnaissance and delayed aerial telemetry feeds. Experienced 45s blind window during corridor transit.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 shadow-xs">
                    <div className="font-bold text-emerald-700 text-xs">Ground Recon Domain</div>
                    <p className="text-slate-600 font-sans text-xs leading-relaxed">
                      Maintained continuous localized visual observation of Waypoint Echo. Unaware of aerial platform downlink latency buffer.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 shadow-xs">
                    <div className="font-bold text-amber-700 text-xs">Cyber / Sensor Domain</div>
                    <p className="text-slate-600 font-sans text-xs leading-relaxed">
                      Possessed raw seismic tripwire fluctuations at T+02:10 that successfully corroborated ground visual before satcom resynchronization.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 9: RECOVERY INTELLIGENCE */}
          {activeSubTab === 'RECOVERY' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-2 border-b border-slate-200 pb-2">
                  <RotateCcw className="w-4 h-4 text-sky-600" />
                  <span>Communication Recovery & Team Adaptation Intelligence</span>
                </h2>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs font-sans shadow-xs">
                  <div className="font-bold text-slate-900 font-mono text-xs">Adaptation Benchmark: 15 Seconds</div>
                  <p className="text-slate-700 text-xs leading-relaxed">
                    Following auxiliary SATCOM recovery at T+04:30, the sub-unit Commander re-assessed multi-domain corroboration and authorized coordinated movement at T+04:45, achieving an adaptation speed of 15 seconds against the target benchmark of &lt;= 30s.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 10: INSTRUCTOR NOTES */}
          {activeSubTab === 'NOTES' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-2">
                    <Edit3 className="w-4 h-4 text-sky-600" />
                    <span>Instructor Observations & Final Debrief Notes</span>
                  </h2>
                  <button
                    onClick={() => setIsEditingNotes(!isEditingNotes)}
                    className="text-xs text-sky-700 hover:underline font-semibold"
                  >
                    {isEditingNotes ? 'Finish Editing' : 'Edit Observations'}
                  </button>
                </div>

                {isEditingNotes ? (
                  <textarea
                    rows={6}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 font-sans focus:outline-none focus:bg-white focus:border-sky-500 leading-relaxed"
                  />
                ) : (
                  <p className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-700 leading-relaxed shadow-xs">
                    {notes}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Reconstruct Context Modal */}
          {selectedDecision && (
            <DecisionContextModal
              decision={selectedDecision}
              onClose={() => setSelectedDecision(null)}
            />
          )}

          {/* Decision Receipt Modal */}
          {selectedReceipt && (
            <DecisionReceiptModal
              isOpen={true}
              receipt={selectedReceipt}
              onClose={() => setSelectedReceipt(null)}
            />
          )}

          {/* Reality Lens Modal */}
          {isRealityLensModalOpen && (
            <RealityLensModal
              isOpen={true}
              onClose={() => setIsRealityLensModalOpen(false)}
            />
          )}

          {/* Provenance Drawer */}
          <InformationProvenanceDrawer
            report={selectedProvenanceReport}
            onClose={() => setSelectedProvenanceReport(null)}
          />
        </>
      )}
    </div>
  );
};
