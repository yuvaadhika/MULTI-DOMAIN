import React from 'react';
import { 
  X, 
  Clock, 
  Shield, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Layers, 
  Network, 
  Database,
  ArrowRight
} from 'lucide-react';
import { InformationReport } from '../types/simulation';

interface InformationProvenanceDrawerProps {
  report: InformationReport | null;
  onClose: () => void;
}

export const InformationProvenanceDrawer: React.FC<InformationProvenanceDrawerProps> = ({
  report,
  onClose
}) => {
  if (!report) return null;

  const prov = report.provenance || {
    source: report.sourceName,
    generatedAt: report.timestamp,
    receivedAt: report.timestamp,
    latencySec: report.isDelayed ? 45 : 0,
    freshness: report.freshness,
    confidence: report.confidence,
    deliveryState: report.isConflicted ? 'CONFLICTED' : report.isDelayed ? 'DELAYED' : 'DELIVERED',
    forwardedBy: 'Direct Tactical Link',
    nodeRoute: [report.sourceName, 'ALPHA-HQ'],
    integrity: report.isConflicted ? 'SUSPECT' : 'VERIFIED'
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 max-w-full bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col font-mono select-none animate-in slide-in-from-right duration-200 text-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 tracking-wider">
              INFORMATION PROVENANCE
            </h2>
            <p className="text-[10px] text-slate-500">
              Audit Report ID: {report.id}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {/* Report Content Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1.5 border-b border-slate-200">
            <span className="font-semibold text-slate-700">Raw Ingest Content</span>
            <span className="text-sky-700 font-bold">{report.sector}</span>
          </div>
          <p className="text-slate-800 font-sans text-xs leading-relaxed">
            {report.content}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {report.tags.map((tag, idx) => (
              <span key={idx} className="text-[10px] px-2 py-0.5 bg-white text-slate-700 rounded border border-slate-200 shadow-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Provenance Metadata Grid */}
        <div className="space-y-2">
          <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
            Telemetry & Ingestion Trace
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl divide-y divide-slate-200 shadow-xs">
            <div className="p-2.5 flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">Originating Source:</span>
              <span className="font-semibold text-slate-900 text-right truncate max-w-[180px]">
                {prov.source}
              </span>
            </div>

            <div className="p-2.5 flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">Domain Authority:</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded font-bold bg-white text-sky-700 border border-sky-200">
                {report.domain}
              </span>
            </div>

            <div className="p-2.5 flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">Generated At:</span>
              <span className="text-slate-900 font-bold">T+{prov.generatedAt}</span>
            </div>

            <div className="p-2.5 flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">Received At:</span>
              <span className="text-slate-900 font-bold">T+{prov.receivedAt}</span>
            </div>

            <div className="p-2.5 flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">Transmission Latency:</span>
              <span className={`font-bold ${prov.latencySec > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {prov.latencySec > 0 ? `${prov.latencySec} sec buffer` : 'Direct (<1 sec)'}
              </span>
            </div>

            <div className="p-2.5 flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">Freshness Index:</span>
              <span className={`px-1.5 py-0.5 text-[10px] rounded font-bold ${
                prov.freshness === 'RECENT' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
                  : 'bg-amber-50 text-amber-700 border border-amber-300'
              }`}>
                {prov.freshness}
              </span>
            </div>

            <div className="p-2.5 flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">Source Confidence:</span>
              <span className={`px-1.5 py-0.5 text-[10px] rounded font-bold ${
                prov.confidence === 'HIGH' ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' :
                prov.confidence === 'MEDIUM' ? 'bg-sky-50 text-sky-700 border border-sky-300' :
                'bg-amber-50 text-amber-700 border border-amber-300'
              }`}>
                {prov.confidence}
              </span>
            </div>

            <div className="p-2.5 flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">Delivery State:</span>
              <span className={`px-1.5 py-0.5 text-[10px] rounded font-bold ${
                prov.deliveryState === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' :
                prov.deliveryState === 'DELAYED' ? 'bg-amber-50 text-amber-700 border border-amber-300' :
                prov.deliveryState === 'CONFLICTED' ? 'bg-rose-50 text-rose-700 border border-rose-300' :
                'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {prov.deliveryState}
              </span>
            </div>

            <div className="p-2.5 flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">Relay / Forwarded By:</span>
              <span className="text-slate-700 truncate max-w-[160px]">
                {prov.forwardedBy || 'Direct Tactical Net'}
              </span>
            </div>
          </div>
        </div>

        {/* Node Hop Route Trace */}
        {prov.nodeRoute && prov.nodeRoute.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
              Network Routing Path
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center space-x-1.5 text-[11px] overflow-x-auto shadow-xs">
              {prov.nodeRoute.map((node, index) => (
                <React.Fragment key={index}>
                  <span className="px-2 py-0.5 bg-white text-slate-800 rounded border border-slate-200 whitespace-nowrap shadow-xs">
                    {node}
                  </span>
                  {index < prov.nodeRoute!.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Allowed Access Roles */}
        <div className="space-y-1.5">
          <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
            Authorized Receivers (Asymmetry Matrix)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {report.allowedRoles.map((role, idx) => (
              <span key={idx} className="text-[10px] px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded font-semibold">
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Close */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
        <button
          onClick={onClose}
          className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors border border-slate-300 shadow-xs"
        >
          Close Inspector
        </button>
      </div>
    </div>
  );
};
