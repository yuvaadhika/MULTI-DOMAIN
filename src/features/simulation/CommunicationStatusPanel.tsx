import React from 'react';
import { 
  Radio, 
  Wifi, 
  WifiOff, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  SlidersHorizontal,
  ZapOff
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationStore';
import { CommunicationChannel, ChannelStatus } from '../../types/simulation';

export const CommunicationStatusPanel: React.FC = () => {
  const { 
    session, 
    currentUser, 
    setChannelDelay, 
    setChannelDropout, 
    restoreChannels,
    formatSimTime 
  } = useSimulation();

  const isInstructor = currentUser.role === 'INSTRUCTOR';

  const getStatusBadge = (status: ChannelStatus, channel: CommunicationChannel) => {
    switch (status) {
      case 'NORMAL':
        return (
          <span className="flex items-center space-x-1 px-2 py-0.5 text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>NORMAL</span>
          </span>
        );
      case 'DELAYED':
        return (
          <span className="flex items-center space-x-1 px-2 py-0.5 text-[10px] font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded animate-pulse">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>DELAYED ({channel.currentDelaySec}s)</span>
          </span>
        );
      case 'INTERRUPTED':
        return (
          <span className="flex items-center space-x-1 px-2 py-0.5 text-[10px] font-mono font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded animate-pulse">
            <WifiOff className="w-3 h-3 text-rose-600" />
            <span>DROPOUT ({channel.dropoutRemainingSec}s)</span>
          </span>
        );
      case 'CONFLICTED':
        return (
          <span className="flex items-center space-x-1 px-2 py-0.5 text-[10px] font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
            <AlertTriangle className="w-3 h-3 text-indigo-600" />
            <span>CONFLICTED</span>
          </span>
        );
      case 'RECOVERING':
        return (
          <span className="flex items-center space-x-1 px-2 py-0.5 text-[10px] font-mono font-semibold bg-sky-50 text-sky-700 border border-sky-200 rounded">
            <RefreshCw className="w-3 h-3 text-sky-600 animate-spin" />
            <span>RECOVERING</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-3.5 font-mono space-y-2.5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Multi-Domain Communication Nets
          </span>
        </div>
        {isInstructor && (
          <button
            onClick={restoreChannels}
            title="Restore all channels to normal"
            className="flex items-center space-x-1 text-[11px] text-sky-700 hover:text-sky-800 px-2.5 py-0.5 rounded-lg bg-sky-50 border border-sky-200 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Restore All</span>
          </button>
        )}
      </div>

      {/* Channels List Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {session.channels.map(channel => (
          <div 
            key={channel.id}
            className={`p-2.5 rounded-lg border transition-all ${
              channel.status === 'INTERRUPTED' ? 'bg-rose-50/70 border-rose-200' :
              channel.status === 'DELAYED' ? 'bg-amber-50/70 border-amber-200' :
              channel.status === 'CONFLICTED' ? 'bg-indigo-50/70 border-indigo-200' :
              'bg-[#f8fafc] border-slate-200'
            }`}
          >
            {/* Top row: Name & Status */}
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="text-[11px] font-bold text-slate-800 truncate" title={channel.name}>
                  {channel.name}
                </div>
                <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">
                  Domain: {channel.domain}
                </div>
              </div>
              {getStatusBadge(channel.status, channel)}
            </div>

            {/* Condition description */}
            <div className="text-[10px] text-slate-600 mb-2 font-sans line-clamp-1">
              {channel.status === 'DELAYED' && (
                <span className="text-amber-700">Outgoing reports delayed by {channel.currentDelaySec}s</span>
              )}
              {channel.status === 'INTERRUPTED' && (
                <span className="text-rose-700 font-semibold">Packet stream severed | Recovery in {channel.dropoutRemainingSec}s</span>
              )}
              {channel.status === 'CONFLICTED' && (
                <span className="text-indigo-700">Conflicting observations reported on this net</span>
              )}
              {channel.status === 'NORMAL' && (
                <span className="text-slate-600">Latency: 8ms • Direct delivery</span>
              )}
              {channel.status === 'RECOVERING' && (
                <span className="text-sky-700">Re-synchronizing cryptographic frames...</span>
              )}
            </div>

            {/* Reliability progress bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[9px] text-slate-500">
                <span>Integrity</span>
                <span className={`font-bold ${
                  channel.reliabilityScore < 40 ? 'text-rose-600' :
                  channel.reliabilityScore < 75 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {channel.reliabilityScore}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    channel.reliabilityScore < 40 ? 'bg-rose-500' :
                    channel.reliabilityScore < 75 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${channel.reliabilityScore}%` }}
                />
              </div>
            </div>

            {/* Instructor Quick Controls (Only visible to Instructor) */}
            {isInstructor && (
              <div className="mt-2 pt-1.5 border-t border-slate-200 flex items-center justify-between gap-1 text-[9px]">
                <button
                  onClick={() => setChannelDelay(channel.id, 30)}
                  className="px-2 py-0.5 rounded bg-white hover:bg-amber-50 text-amber-700 border border-slate-300 hover:border-amber-300 transition-colors"
                >
                  +30s Delay
                </button>
                <button
                  onClick={() => setChannelDropout(channel.id, 20)}
                  className="px-2 py-0.5 rounded bg-white hover:bg-rose-50 text-rose-700 border border-slate-300 hover:border-rose-300 transition-colors"
                >
                  Dropout
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
