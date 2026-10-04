import React from 'react';
import { IntentCard } from '../../types/simulation';
import { SEED_INTENT_CARD } from '../../data/seedData';
import { Shield, Compass, Radio, AlertCircle, CheckCircle2, ChevronRight, Zap, Target, Flag, X } from 'lucide-react';

interface IntentCardPanelProps {
  intentCard?: IntentCard;
  isCommsBlackout?: boolean;
  onExecuteAutonomousRule?: (ruleIndex: number) => void;
  onClose?: () => void;
}

export const IntentCardPanel: React.FC<IntentCardPanelProps> = ({
  intentCard = SEED_INTENT_CARD,
  isCommsBlackout = false,
  onExecuteAutonomousRule,
  onClose
}) => {
  return (
    <div className={`rounded-xl border overflow-hidden flex flex-col transition-all shadow-xl bg-white font-mono ${
      isCommsBlackout
        ? 'border-rose-400 ring-2 ring-rose-200'
        : 'border-slate-200'
    }`}>
      
      {/* Header */}
      <div className={`px-5 sm:px-6 py-3.5 border-b flex items-center justify-between ${
        isCommsBlackout
          ? 'bg-rose-50 border-rose-200 text-rose-900'
          : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg border ${
            isCommsBlackout
              ? 'bg-rose-100 text-rose-700 border-rose-300'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
                Signature Innovation
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900">
                COMMANDER'S INTENT CARD (BLACKOUT PROTOCOL)
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-sans">
              Auftragstaktik / Mission Command: Autonomous coordination rules when comms fail
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCommsBlackout ? (
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-lg bg-rose-600 text-white animate-pulse">
              BLACKOUT MODE: AUTONOMOUS ACTION ARMED
            </span>
          ) : (
            <span className="px-2.5 py-0.5 text-[10px] font-mono rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              STANDBY / ARMED
            </span>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Close Intent Card"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto max-h-[550px] bg-white">
        
        {/* Core Commander's Intent Box */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl shadow-xs">
          <div className="flex items-center gap-2 text-amber-800 font-mono font-bold text-[11px] mb-1 uppercase">
            <Target className="w-4 h-4 text-amber-600" />
            <span>Commander's Core Intent (Outlives Jamming)</span>
          </div>
          <p className="text-xs text-amber-950 font-sans leading-relaxed">
            "{intentCard.commandersCoreIntent}"
          </p>
          <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-center justify-between text-[10px] font-mono text-amber-800">
            <span>Issued By: <strong className="text-amber-950">{intentCard.issuedByCallsign}</strong></span>
            <span>Timing: <strong className="text-amber-950">{intentCard.issuedAt}</strong></span>
          </div>
        </div>

        {/* Decisional Thresholds */}
        <div>
          <label className="text-[10px] font-mono text-slate-600 uppercase tracking-wider block mb-1.5 font-semibold">
            Key Decisional Thresholds
          </label>
          <div className="space-y-1.5">
            {intentCard.keyDecisionalThresholds.map((threshold, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 mt-0.5 shrink-0" />
                <span className="text-[11px] font-sans leading-snug">{threshold}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Blackout Autonomous Action Rules */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-mono text-rose-700 uppercase tracking-wider font-bold">
              Autonomous Action Rules under Disruption
            </label>
            <span className="text-[10px] font-mono text-slate-500">Pre-authorized protocols</span>
          </div>

          <div className="space-y-2">
            {intentCard.blackoutAutonomousRules.map((rule, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 hover:border-amber-300 p-3.5 rounded-xl transition-colors shadow-xs"
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="text-amber-800 font-bold uppercase">Trigger Condition:</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] border font-bold ${
                    rule.riskTolerance === 'CONSERVATIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    rule.riskTolerance === 'BALANCED' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                    'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {rule.riskTolerance} RISK
                  </span>
                </div>
                <div className="text-[11px] text-slate-800 mb-2 font-medium font-sans">
                  {rule.triggerCondition}
                </div>

                <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200 mb-2">
                  <span className="text-[10px] font-mono text-emerald-800 uppercase block font-bold">
                    ➔ Authorized Action:
                  </span>
                  <span className="text-xs text-emerald-950 font-medium font-sans">
                    {rule.authorizedAutonomousAction}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Recovery Protocol: {rule.reportingRequirementOnRecovery}</span>
                  {onExecuteAutonomousRule && (
                    <button
                      onClick={() => onExecuteAutonomousRule(idx)}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-200 transition-colors shadow-xs"
                    >
                      Execute Rule #{idx + 1}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Secondary Rally & End State */}
        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-xs">
            <span className="text-[10px] text-slate-500 block uppercase">Secondary Rally Point</span>
            <strong className="text-sky-700">{intentCard.secondaryRallyPoint}</strong>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-xs">
            <span className="text-[10px] text-slate-500 block uppercase">Objective End State</span>
            <strong className="text-slate-800">Zero Unverified False Alarms</strong>
          </div>
        </div>

      </div>

      {/* Footer with Close Button */}
      <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 text-xs font-mono text-slate-500 flex items-center justify-between">
        <span className="text-[11px]">
          AUFTRAGSTAKTIK MISSION COMMAND • DEFENSE AUTONOMY PROTOCOL
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors shadow-xs"
          >
            Close Intent Card
          </button>
        )}
      </div>

    </div>
  );
};
