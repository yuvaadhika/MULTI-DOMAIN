import React, { useState } from 'react';
import { CommunicationTracePacket, TracePacketStatus } from '../../types/simulation';
import { SEED_COMMUNICATION_TRACE_PACKETS } from '../../data/seedData';
import { Network, ArrowRight, AlertTriangle, ShieldAlert, CheckCircle2, Clock, Filter, Radio, RefreshCw, X } from 'lucide-react';

interface CommunicationTraceViewProps {
  packets?: CommunicationTracePacket[];
  onClose?: () => void;
  isCompact?: boolean;
}

export const CommunicationTraceView: React.FC<CommunicationTraceViewProps> = ({
  packets = SEED_COMMUNICATION_TRACE_PACKETS,
  onClose,
  isCompact = false
}) => {
  const [selectedStatus, setSelectedStatus] = useState<TracePacketStatus | 'ALL'>('ALL');
  const [selectedPacket, setSelectedPacket] = useState<CommunicationTracePacket | null>(packets[0] || null);

  const filteredPackets = selectedStatus === 'ALL'
    ? packets
    : packets.filter(p => p.status === selectedStatus);

  const getStatusBadge = (status: TracePacketStatus) => {
    switch (status) {
      case 'DELIVERED_NORMAL':
        return <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">DELIVERED DIRECT</span>;
      case 'DELAYED':
        return <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">BUFFER DELAYED</span>;
      case 'DROPPED':
        return <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-rose-50 text-rose-700 border border-rose-200 font-semibold">PACKET DROPPED</span>;
      case 'ALTERED_CORRUPTED':
        return <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-purple-50 text-purple-700 border border-purple-200 font-semibold">EW SPOOFED / ALTERED</span>;
      case 'PARTIAL_PAYLOAD':
        return <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">PARTIAL PAYLOAD</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-100 text-slate-600">DISPATCHED</span>;
    }
  };

  return (
    <div className={`bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-xl font-mono ${
      isCompact ? 'h-[480px]' : 'h-[620px]'
    }`}>
      {/* Header */}
      <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-sky-50 border border-sky-200 rounded-lg text-sky-700">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-semibold uppercase text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                Signature Innovation
              </span>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                COMMUNICATION TRACE (PACKET-LEVEL WIRE TAP)
              </h3>
            </div>
            <p className="text-[10px] text-slate-500 font-sans">
              Real-time telemetry tracking delayed, dropped, partial, and EW-altered transmissions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filters */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-lg text-[10px] font-mono shadow-xs">
            {(['ALL', 'DELAYED', 'DROPPED', 'ALTERED_CORRUPTED'] as const).map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  selectedStatus === st
                    ? 'bg-sky-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Close Communication Trace"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Packet List (Left) + Hop / Payload Inspector (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
        
        {/* Packet Feed Left Column */}
        <div className="md:col-span-5 border-r border-slate-200 overflow-y-auto p-3 space-y-2 bg-slate-50">
          {filteredPackets.map(pkt => {
            const isSelected = selectedPacket?.packetId === pkt.packetId;
            return (
              <div
                key={pkt.packetId}
                onClick={() => setSelectedPacket(pkt)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-white border-sky-400 shadow-xs ring-1 ring-sky-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-sky-700">
                    {pkt.packetId} • T+{pkt.dispatchedAt}
                  </span>
                  {getStatusBadge(pkt.status)}
                </div>

                <div className="text-xs text-slate-800 font-semibold truncate mb-1">
                  {pkt.sourceNode} ➔ {pkt.targetRole}
                </div>

                <p className="text-[11px] text-slate-600 line-clamp-1 font-mono">
                  {pkt.transmittedPayload}
                </p>

                {pkt.latencyMs > 0 && (
                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Latency: {(pkt.latencyMs / 1000).toFixed(1)}s</span>
                    <span className="text-amber-700 font-semibold">{pkt.hops.length} Network Hops</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Packet Inspector Right Column */}
        <div className="md:col-span-7 p-5 overflow-y-auto space-y-4 bg-white">
          {selectedPacket ? (
            <>
              {/* Selected Packet Header */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">
                    Active Packet Inspection
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
                    {selectedPacket.packetId} ({selectedPacket.sourceNode})
                  </h4>
                </div>
                <div>{getStatusBadge(selectedPacket.status)}</div>
              </div>

              {/* Hop-by-Hop Transmission Pipeline */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-xs">
                <span className="text-[10px] font-mono uppercase text-slate-700 block mb-3 font-semibold">
                  Multi-Hop Transmission Lineage
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedPacket.hops.map((hop, index) => {
                    const isLast = index === selectedPacket.hops.length - 1;
                    return (
                      <React.Fragment key={index}>
                        <div className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-mono flex flex-col shadow-xs ${
                          hop.status === 'CLEAN' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          hop.status === 'JAMMED' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          hop.status === 'DELAYED' ? 'bg-sky-50 text-sky-800 border-sky-200' :
                          'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          <span className="font-bold">{hop.node}</span>
                          <span className="text-[9px] opacity-80">{hop.status} • {hop.timestamp}</span>
                        </div>
                        {!isLast && (
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Payload Comparison: Original vs Transmitted */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-700 block font-semibold">
                  Payload Integrity Differential
                </span>

                <div className="grid grid-cols-1 gap-2 text-xs font-mono">
                  {/* Original Dispatched */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl shadow-xs">
                    <span className="text-[10px] text-emerald-800 uppercase font-bold block mb-1">
                      Original Dispatched Payload (Source Truth)
                    </span>
                    <p className="text-emerald-950 font-sans">{selectedPacket.originalPayload}</p>
                  </div>

                  {/* Transmitted Received */}
                  <div className={`p-3 rounded-xl border shadow-xs ${
                    selectedPacket.status === 'ALTERED_CORRUPTED' ? 'bg-purple-50 border-purple-200 text-purple-900' :
                    selectedPacket.status === 'DROPPED' ? 'bg-rose-50 border-rose-200 text-rose-900' :
                    'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    <span className="text-[10px] uppercase font-bold block mb-1 text-slate-500">
                      Actual Delivered / Buffered Payload
                    </span>
                    <p className="font-sans">{selectedPacket.transmittedPayload}</p>
                  </div>
                </div>

                {selectedPacket.corruptionDetails && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2 shadow-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[11px] font-mono uppercase text-amber-800">Degradation Mechanism:</strong>
                      <span className="font-sans">{selectedPacket.corruptionDetails}</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
              Select a packet from the trace queue to inspect lineage
            </div>
          )}
        </div>

      </div>

      {/* Footer Info & Close Button */}
      <div className="px-5 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-mono text-slate-500">
        <span className="text-[11px]">
          SENTINEL-X PACKET WIRE TAP • EW TELEMETRY ACTIVE
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors shadow-xs"
          >
            Close Communication Trace
          </button>
        )}
      </div>
    </div>
  );
};
