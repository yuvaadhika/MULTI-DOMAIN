import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Send, 
  Clock, 
  HelpCircle, 
  FileText, 
  ShieldAlert, 
  Activity,
  Layers,
  CheckCircle2,
  ExternalLink,
  Eye,
  Shield,
  Compass,
  Lock
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationStore';
import { DecisionRecord, DecisionReceipt } from '../../types/simulation';
import { DecisionContextModal } from '../instructor/DecisionContextModal';
import { DecisionReceiptModal } from '../../components/DecisionReceiptModal';
import { IntentCardPanel } from './IntentCardPanel';
import { RealityLensModal } from '../../components/RealityLensModal';
import { SEED_DECISION_RECEIPTS } from '../../data/seedData';

export const DecisionPanel: React.FC = () => {
  const { session, currentUser, submitDecision, uncertaintyMetrics, formatSimTime, isObserver } = useSimulation();

  const [selectedAction, setSelectedAction] = useState<string>('Request Cross-Domain Verification & Hold Position');
  const [rationaleText, setRationaleText] = useState<string>('');
  const [fallbackPlanText, setFallbackPlanText] = useState<string>('');
  const [assumedTruthText, setAssumedTruthText] = useState<string>('');
  const [confidence, setConfidence] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  
  const [selectedDecisionForModal, setSelectedDecisionForModal] = useState<DecisionRecord | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<DecisionReceipt | null>(null);
  const [isIntentOpen, setIsIntentOpen] = useState<boolean>(false);
  const [isRealityLensOpen, setIsRealityLensOpen] = useState<boolean>(false);

  const [latencySec, setLatencySec] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLatencySec(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const actionOptions = [
    'Request Cross-Domain Verification & Hold Position',
    'Continue Observation Under Concealment',
    'Reassess North Sector Perimeter & Adjust Posture',
    'Deploy Autonomous Perimeter Sensor Probe',
    'Transition to Decentralized Standing Directives',
    'Authorize Coordinated Corridor Advance',
    'Escalate to Secondary Spectrum Protocol'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rationaleText.trim() || isObserver) return;

    submitDecision(selectedAction, rationaleText.trim(), confidence);

    // Create Immutable Decision Receipt
    const newReceipt: DecisionReceipt = {
      receiptId: `RCP-${Math.floor(1000 + Math.random() * 9000)}-${currentUser?.callsign || 'ALPHA'}`,
      decisionId: `dec-${Date.now()}`,
      participantId: currentUser?.id || 'usr-1',
      participantName: currentUser?.name || 'Trainee Commander',
      participantRole: currentUser?.role || 'COMMANDER',
      timestamp: formatSimTime(session.simulationSec),
      simulationSec: session.simulationSec,
      action: selectedAction,
      primaryRationale: rationaleText.trim(),
      confidence: confidence,
      fallbackPlan: fallbackPlanText.trim() || 'If link remains dark > 60s, maintain passive observation and await scheduled verification pass.',
      assumedGroundTruth: assumedTruthText.trim() || 'Assumed local sensor telemetry represents accurate operational posture.',
      decisionThresholdMet: 'Uncertainty threshold validated against local feed.',
      informationDebtAtCreation: uncertaintyMetrics.debt.current,
      activeDegradationCount: uncertaintyMetrics.delayedSources + uncertaintyMetrics.unavailableSources,
      availableReportIds: session.reports.filter(r => !r.isDropped).map(r => r.id),
      missingCriticalReportIds: session.reports.filter(r => r.isDropped).map(r => r.id),
      cryptographicHash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`
    };

    setActiveReceipt(newReceipt);
    setRationaleText('');
    setFallbackPlanText('');
    setAssumedTruthText('');
    setLatencySec(0);
  };

  const userDecisions = session.decisions;

  return (
    <div className="bg-white border border-slate-200 rounded-xl flex flex-col h-full font-mono shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center space-x-2">
          <CheckSquare className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Command Decision Capture
          </span>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsIntentOpen(true)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold transition-colors"
            title="Open Commander's Intent Card"
          >
            <Compass className="w-3 h-3" />
            <span>Intent Card</span>
          </button>
          
          <button
            onClick={() => setIsRealityLensOpen(true)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-[10px] font-bold transition-colors"
            title="Open Reality Lens 3-Way Triangulation"
          >
            <Eye className="w-3 h-3" />
            <span>Reality Lens</span>
          </button>

          {/* Live Latency Tracker */}
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-600 bg-[#f8fafc] px-2.5 py-1 rounded-lg border border-slate-200">
            <Clock className="w-3 h-3 text-sky-600" />
            <span>Elapsed: <strong className="text-slate-900">{latencySec}s</strong></span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Observer Mode Notice */}
        {isObserver ? (
          <div className="p-3.5 bg-[#f8fafc] border border-slate-200 rounded-xl text-xs space-y-1.5">
            <div className="flex items-center space-x-2 text-sky-700 font-bold">
              <Eye className="w-4 h-4" />
              <span>Observer Mode Active</span>
            </div>
            <p className="text-slate-600 font-sans text-xs">
              You are evaluating this exercise in read-only mode. Decision commitment is assigned to active sub-unit commanders.
            </p>
          </div>
        ) : (
          /* Decision Submission Form */
          <form onSubmit={handleSubmit} className="space-y-3 bg-[#f8fafc] p-3.5 rounded-xl border border-slate-200">
            {/* Action Select */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-800 font-semibold block">
                Action Selection (Command Directive):
              </label>
              <select
                value={selectedAction}
                onChange={e => setSelectedAction(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              >
                {actionOptions.map((opt, idx) => (
                  <option key={idx} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Rationale Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-slate-800 font-semibold">
                  Decision Rationale & Evidence:
                </label>
                <span className="text-[10px] text-sky-700 font-bold">Required</span>
              </div>
              <textarea
                rows={2}
                value={rationaleText}
                onChange={e => setRationaleText(e.target.value)}
                placeholder="Document what information influenced this decision (e.g. sensor conflict, comms lag, ground vs aerial disparity, uncertainty assessment)..."
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 font-sans"
              />
            </div>

            {/* INNOVATION 2 INPUT: Fallback Plan */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-amber-800 font-bold flex items-center gap-1">
                  <Shield className="w-3 h-3 text-amber-600" />
                  <span>Designated Fallback Plan (If Comms Fail):</span>
                </label>
                <span className="text-[10px] text-amber-700 font-semibold">Innovation 2</span>
              </div>
              <input
                type="text"
                value={fallbackPlanText}
                onChange={e => setFallbackPlanText(e.target.value)}
                placeholder="e.g. If air confirmation delayed > 60s, withdraw 200m to Secondary Line Bravo..."
                className="w-full bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs text-amber-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-sans"
              />
            </div>

            {/* Assumed Ground Truth */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-700 font-semibold block">
                Assumed Ground Reality (Mental Model):
              </label>
              <input
                type="text"
                value={assumedTruthText}
                onChange={e => setAssumedTruthText(e.target.value)}
                placeholder="e.g. Suspect opposing EW outpost at Relay-7; no immediate physical threat..."
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 font-sans"
              />
            </div>

            {/* Confidence Rating Selection & Submit */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-700 font-semibold block">
                  Assessment Confidence:
                </span>
                <div className="flex items-center space-x-1.5">
                  {(['LOW', 'MEDIUM', 'HIGH'] as const).map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setConfidence(level)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                        confidence === level
                          ? level === 'HIGH'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : level === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-800 border border-amber-300'
                            : 'bg-rose-50 text-rose-800 border border-rose-300'
                          : 'bg-white text-slate-600 border border-slate-300 hover:text-slate-900'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!rationaleText.trim()}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:hover:bg-sky-600 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Commit & Seal Receipt</span>
              </button>
            </div>
          </form>
        )}

        {/* Captured Decision History */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-700 pb-1 border-b border-slate-200">
            <span className="font-semibold text-slate-900">Logged Decisions ({userDecisions.length})</span>
            <span className="text-[10px] text-sky-700 font-semibold">Click to inspect Context or Receipt</span>
          </div>

          <div className="space-y-2">
            {userDecisions.length === 0 ? (
              <div className="p-4 text-center text-[11px] text-slate-500 italic bg-white border border-dashed border-slate-200 rounded-xl">
                Zero decisions submitted yet in current exercise.
              </div>
            ) : (
              userDecisions.map((dec, idx) => (
                <div
                  key={dec.id}
                  className="p-3 rounded-xl bg-[#f8fafc] border border-slate-200 hover:border-sky-300 text-xs space-y-2 transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-[11px]">{dec.action}</span>
                    <span className="text-sky-700 text-[10px] font-bold">T+{dec.timestamp}</span>
                  </div>
                  <p className="text-slate-600 font-sans text-[11px] line-clamp-2 italic">
                    "{dec.rationale}"
                  </p>
                  
                  {/* Action buttons on decision */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-200">
                    <span>Latency: <strong className="text-slate-800">{dec.decisionLatencySec}s</strong></span>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const seedReceipt = SEED_DECISION_RECEIPTS[idx] || {
                            receiptId: `RCP-${idx + 8000}-MERIDIAN`,
                            decisionId: dec.id,
                            participantId: dec.participantId,
                            participantName: dec.participantName,
                            participantRole: dec.participantRole,
                            timestamp: dec.timestamp,
                            simulationSec: dec.simulationSec,
                            action: dec.action,
                            primaryRationale: dec.rationale,
                            confidence: dec.confidence,
                            fallbackPlan: 'Autonomous perimeter observation via secondary thermal relay.',
                            assumedGroundTruth: 'Unverified acoustic spike in Sector.',
                            decisionThresholdMet: 'Information conflict index > 35%.',
                            informationDebtAtCreation: 32,
                            activeDegradationCount: 1,
                            availableReportIds: ['rep-1', 'rep-2'],
                            missingCriticalReportIds: ['rep-3'],
                            cryptographicHash: '0x9a8f2c41829e01f447db0918c7'
                          };
                          setActiveReceipt(seedReceipt);
                        }}
                        className="flex items-center gap-1 text-amber-700 hover:underline font-mono font-semibold"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Receipt</span>
                      </button>

                      <button
                        onClick={() => setSelectedDecisionForModal(dec)}
                        className="flex items-center text-sky-700 hover:underline font-mono font-semibold"
                      >
                        <span>Evidence Context</span>
                        <ExternalLink className="w-2.5 h-2.5 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Decision Context Modal */}
      {selectedDecisionForModal && (
        <DecisionContextModal
          decision={selectedDecisionForModal}
          onClose={() => setSelectedDecisionForModal(null)}
        />
      )}

      {/* Decision Receipt Modal */}
      {activeReceipt && (
        <DecisionReceiptModal
          isOpen={true}
          receipt={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}

      {/* Reality Lens Modal */}
      {isRealityLensOpen && (
        <RealityLensModal
          isOpen={true}
          onClose={() => setIsRealityLensOpen(false)}
          selectedRole={currentUser?.role}
        />
      )}

      {/* Intent Card Modal */}
      {isIntentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in font-mono">
          <div className="w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl">
            <IntentCardPanel
              onClose={() => setIsIntentOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

