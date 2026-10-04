import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  Inbox, 
  MessageSquare, 
  Layers, 
  ShieldAlert,
  Cpu,
  GitBranch,
  Eye,
  Database,
  Info
} from 'lucide-react';
import { DecisionRecord, InformationReport } from '../../types/simulation';
import { DecisionEvidenceGraph } from '../../components/DecisionEvidenceGraph';
import { InformationProvenanceDrawer } from '../../components/InformationProvenanceDrawer';

interface Props {
  decision: DecisionRecord;
  onClose: () => void;
}

export const DecisionContextModal: React.FC<Props> = ({ decision, onClose }) => {
  const { contextSnapshot, informationEnvironmentState, evidenceGraph } = decision;
  const [activeTab, setActiveTab] = useState<'CONTEXT' | 'EVIDENCE_GRAPH' | 'ROLE_GAP'>('CONTEXT');
  const [selectedReport, setSelectedReport] = useState<InformationReport | null>(null);

  const availableReports = contextSnapshot?.informationAvailable || [];
  const unavailableReports = contextSnapshot?.informationUnavailable || [];
  const delayedReports = contextSnapshot?.delayedReports || [];
  const conflictingReports = contextSnapshot?.conflictingReports || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs select-none font-mono text-slate-900">
      <div className="bg-white border border-slate-200 w-full max-w-5xl max-h-[92vh] rounded-xl shadow-2xl flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-[#f8fafc]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] bg-sky-50 border border-sky-200 text-sky-700 font-bold rounded">
                DECISION CONTEXT SNAPSHOT
              </span>
              <span className="text-slate-700 font-bold">
                T+{decision.timestamp}
              </span>
              {decision.isReversal && (
                <span className="px-2 py-0.5 text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded">
                  DECISION ADAPTATION
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-slate-900 mt-1 truncate max-w-2xl">
              {decision.action}
            </div>
            <div className="text-[11px] text-slate-600">
              Participant: <strong className="text-slate-900">{decision.participantName}</strong> ({decision.participantRole}) • Latency: <strong className="text-sky-700">{decision.decisionLatencySec}s</strong> • Confidence: <strong className="text-emerald-700">{decision.confidence}</strong>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center space-x-2 px-4 pt-3 border-b border-slate-200 bg-[#f8fafc]">
          <button
            onClick={() => setActiveTab('CONTEXT')}
            className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-t-lg border-t border-x transition-colors ${
              activeTab === 'CONTEXT'
                ? 'bg-white text-sky-700 border-slate-200 shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Situational Picture (At Decision Time)</span>
          </button>

          <button
            onClick={() => setActiveTab('EVIDENCE_GRAPH')}
            className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-t-lg border-t border-x transition-colors ${
              activeTab === 'EVIDENCE_GRAPH'
                ? 'bg-white text-sky-700 border-slate-200 shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Decision Evidence Graph</span>
          </button>

          <button
            onClick={() => setActiveTab('ROLE_GAP')}
            className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-t-lg border-t border-x transition-colors ${
              activeTab === 'ROLE_GAP'
                ? 'bg-white text-sky-700 border-slate-200 shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Role Information Gap (Blindness)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {activeTab === 'CONTEXT' && (
            <div className="space-y-4">
              {/* Telemetry Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <div className="bg-[#f8fafc] p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Reported Confidence</div>
                  <div className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      decision.confidence === 'HIGH' ? 'bg-emerald-500' :
                      decision.confidence === 'MEDIUM' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    <span>{decision.confidence}</span>
                  </div>
                </div>

                <div className="bg-[#f8fafc] p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Uncertainty Index</div>
                  <div className="text-sm font-bold text-amber-700 flex items-center space-x-1.5">
                    <Cpu className="w-4 h-4 text-amber-600" />
                    <span>{informationEnvironmentState.uncertaintyIndex}/100</span>
                  </div>
                </div>

                <div className="bg-[#f8fafc] p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Information Debt</div>
                  <div className="text-sm font-bold text-amber-700">
                    {informationEnvironmentState.informationDebt || 32} pts
                  </div>
                </div>

                <div className="bg-[#f8fafc] p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Available Reports</div>
                  <div className="text-sm font-bold text-sky-700">
                    {availableReports.length} Sources Ingested
                  </div>
                </div>
              </div>

              {/* Rationale Box */}
              <div className="bg-[#f8fafc] border border-slate-200 p-3.5 rounded-xl space-y-1.5 shadow-2xs">
                <div className="text-[11px] font-bold text-slate-800 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>Participant Rationale Provided:</span>
                </div>
                <div className="text-xs text-slate-700 font-sans leading-relaxed pl-5 border-l-2 border-sky-500 italic">
                  "{decision.rationale}"
                </div>
              </div>

              {/* Grid: What Participant Knew vs What Was Delayed/Conflicted */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Reports Available */}
                <div className="bg-[#f8fafc] border border-slate-200 p-3.5 rounded-xl space-y-2 shadow-2xs">
                  <div className="text-[11px] font-bold text-slate-800 flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <span className="flex items-center space-x-1.5">
                      <Inbox className="w-3.5 h-3.5 text-sky-600" />
                      <span>Information Available to Role ({availableReports.length})</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Click to audit</span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {availableReports.length > 0 ? (
                      availableReports.map(rep => (
                        <div
                          key={rep.id}
                          onClick={() => setSelectedReport(rep)}
                          className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-sky-400 cursor-pointer text-[11px] space-y-1 transition-colors shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sky-700 font-semibold">{rep.sourceName}</span>
                            <span className="text-slate-500 text-[10px]">T+{rep.timestamp}</span>
                          </div>
                          <p className="text-slate-600 font-sans line-clamp-2 text-[11px]">{rep.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 text-[11px] italic p-2">
                        No direct sensory feeds logged at timestamp.
                      </div>
                    )}
                  </div>
                </div>

                {/* Delayed / Conflicted Reports */}
                <div className="bg-[#f8fafc] border border-slate-200 p-3.5 rounded-xl space-y-2 shadow-2xs">
                  <div className="text-[11px] font-bold text-slate-800 flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <span className="flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Degraded / Conflicted Telemetry</span>
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {delayedReports.concat(conflictingReports).length > 0 ? (
                      delayedReports.concat(conflictingReports).map(rep => (
                        <div
                          key={rep.id}
                          onClick={() => setSelectedReport(rep)}
                          className={`p-2.5 rounded-lg border cursor-pointer text-[11px] space-y-1 transition-colors ${
                            rep.isConflicted 
                              ? 'bg-rose-50 border-rose-200 text-rose-900' 
                              : 'bg-amber-50 border-amber-200 text-amber-900'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{rep.sourceName}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                              {rep.isConflicted ? 'Conflicted' : 'Delayed Buffer'}
                            </span>
                          </div>
                          <p className="font-sans line-clamp-2 text-[11px] opacity-90">{rep.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-emerald-700 text-[11px] p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                        Zero active conflicting or delayed feeds at decision moment.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Communication Channel State Matrix */}
              <div className="bg-[#f8fafc] border border-slate-200 p-3.5 rounded-xl space-y-2 shadow-2xs">
                <div className="text-[11px] font-bold text-slate-800 flex items-center space-x-1.5 pb-1.5 border-b border-slate-200">
                  <Radio className="w-3.5 h-3.5 text-sky-600" />
                  <span>Communication Channel Status at Decision Time:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {Object.entries(contextSnapshot?.channelStates || {}).map(([chId, status]) => (
                    <div key={chId} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-700 uppercase text-[10px]">{chId}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        status === 'NORMAL' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        status === 'DELAYED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        status === 'INTERRUPTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {status as string}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'EVIDENCE_GRAPH' && (
            <div className="space-y-3">
              <DecisionEvidenceGraph 
                graph={evidenceGraph} 
                onSelectNodeReport={id => {
                  const match = availableReports.find(r => r.sourceId === id);
                  if (match) setSelectedReport(match);
                }} 
              />
            </div>
          )}

          {activeTab === 'ROLE_GAP' && (
            <div className="space-y-4">
              <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-4 space-y-2 shadow-2xs">
                <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-sky-600" />
                  <span>Role Information Gap Analysis</span>
                </div>
                <p className="text-xs text-slate-600 font-sans leading-relaxed">
                  Evaluates which telemetry feeds were isolated within specific domains (Ground, Air, Network) and withheld from the Commander due to latency, routing, or asymmetry policies.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-3.5 space-y-2 shadow-2xs">
                  <div className="text-[11px] font-bold text-slate-800 pb-1.5 border-b border-slate-200">
                    Feeds Known ONLY to Sub-Units (Unknown to Commander)
                  </div>
                  {unavailableReports.length > 0 ? (
                    <div className="space-y-1.5">
                      {unavailableReports.map(rep => (
                        <div key={rep.id} className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-amber-700">{rep.sourceName}</span>
                            <span className="text-[10px] text-slate-500">Domain: {rep.domain}</span>
                          </div>
                          <p className="text-slate-600 font-sans text-xs">{rep.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-500 text-xs italic p-3 text-center">
                      Zero isolated feeds. All available telemetry was accessible to Commander.
                    </div>
                  )}
                </div>

                <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-3.5 space-y-2 shadow-2xs">
                  <div className="text-[11px] font-bold text-slate-800 pb-1.5 border-b border-slate-200">
                    Command Assessment Posture
                  </div>
                  <div className="p-3.5 bg-white border border-slate-200 rounded-lg text-xs space-y-2">
                    <div className="text-slate-800 font-semibold">
                      Asymmetry Index at Commit:
                    </div>
                    <p className="text-slate-600 font-sans text-xs">
                      The Commander committed this action with access to {availableReports.length} out of {availableReports.length + unavailableReports.length} multi-domain telemetry feeds.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-[#f8fafc] flex items-center justify-between">
          <div className="text-[10px] text-slate-500">
            SENTINEL-X Audit Trail • Exercise {decision.exerciseId}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors border border-slate-300 shadow-2xs"
          >
            Close Snapshot
          </button>
        </div>
      </div>

      {/* Embedded Provenance Drawer if report clicked */}
      <InformationProvenanceDrawer
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
};
