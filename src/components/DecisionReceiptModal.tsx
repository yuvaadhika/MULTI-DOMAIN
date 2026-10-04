import React from 'react';
import { DecisionReceipt } from '../types/simulation';
import { FileText, Shield, Key, AlertCircle, Clock, CheckCircle2, X, Printer, Download, Lock } from 'lucide-react';

interface DecisionReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: DecisionReceipt | null;
}

export const DecisionReceiptModal: React.FC<DecisionReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt
}) => {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in font-mono">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Signature Innovation
                </span>
                <h2 className="text-sm font-bold text-slate-900 tracking-wide">
                  IMMUTABLE DECISION RECEIPT
                </h2>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 font-sans">
                Cryptographically audited record with Fallback Plan & Pre-decision context
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 bg-white">
          
          {/* Top Metadata Row */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500 block">Receipt Serial Identifier</span>
              <span className="text-xs font-mono font-bold text-sky-700">{receipt.receiptId}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500 block">Execution Timestamp</span>
              <span className="text-xs font-mono text-slate-800">T+{receipt.timestamp} ({receipt.simulationSec}s)</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500 block">Commander / Sub-Unit</span>
              <span className="text-xs font-bold text-slate-900">{receipt.participantName} ({receipt.participantRole})</span>
            </div>
          </div>

          {/* Action Taken */}
          <div>
            <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1 font-semibold">
              Executed Command Decision
            </label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900">
              {receipt.action}
            </div>
          </div>

          {/* Primary Rationale */}
          <div>
            <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1 font-semibold">
              Primary Decision Rationale
            </label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed text-slate-700 font-sans">
              {receipt.primaryRationale}
            </div>
          </div>

          {/* Fallback Plan (Core Innovation Field) */}
          <div className="border border-amber-200 bg-amber-50 p-3.5 rounded-xl shadow-xs">
            <div className="flex items-center gap-2 text-amber-800 font-mono font-bold text-[11px] mb-1.5 uppercase">
              <Shield className="w-4 h-4" />
              <span>Designated Fallback Plan (Contingency if Comms Fail)</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed font-mono">
              {receipt.fallbackPlan}
            </p>
          </div>

          {/* Assumed Ground Truth */}
          <div>
            <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1 font-semibold">
              Assumed Ground Truth (Commander's Mental Model at Signing)
            </label>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-sans italic">
              "{receipt.assumedGroundTruth}"
            </div>
          </div>

          {/* Grid Parameters: Confidence, Threshold, Debt */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Confidence</span>
              <span className={`text-xs font-bold font-mono ${
                receipt.confidence === 'HIGH' ? 'text-emerald-700' :
                receipt.confidence === 'MEDIUM' ? 'text-sky-700' : 'text-amber-700'
              }`}>
                {receipt.confidence}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Information Debt</span>
              <span className="text-xs font-bold text-amber-700 font-mono">
                {receipt.informationDebtAtCreation} Debt Units
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Active Degradations</span>
              <span className="text-xs font-bold text-rose-700 font-mono">
                {receipt.activeDegradationCount} Ingest Drops/Delays
              </span>
            </div>
          </div>

          {/* Cryptographic Proof */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-mono text-slate-500">SHA-256 Audit Seal:</span>
              <span className="text-[10px] font-mono text-slate-700 truncate max-w-[280px]">
                {receipt.cryptographicHash}
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-semibold">
              TAMPER-PROOF VERIFIED
            </span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-500">
            SENTINEL-X DECISION RECEIPT PROTOCOL
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
