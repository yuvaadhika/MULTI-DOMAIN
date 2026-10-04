import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Clock, 
  AlertCircle, 
  Check, 
  Radio, 
  WifiOff, 
  User 
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationStore';
import { TeamMessage } from '../../types/simulation';

export const TeamCommunicationPanel: React.FC = () => {
  const { session, currentUser, sendMessage } = useSimulation();
  const [inputText, setInputText] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'TEAM_ALPHA' | 'COMMAND_DIRECT' | 'BROADCAST'>('TEAM_ALPHA');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const teamNetChannel = session.channels.find(c => c.id === 'ch-team');
  const isNetSevered = teamNetChannel?.status === 'INTERRUPTED';
  const isNetDelayed = teamNetChannel?.status === 'DELAYED';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText.trim(), selectedChannel);
    setInputText('');
  };

  const tacticalQuickPrompts = [
    'Confirm latest observation in Sector North.',
    'Experiencing downlink latency on aerial feed.',
    'Acoustic sensor triggered; cross-referencing RF.',
    'Hold current posture pending secondary verification.'
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl flex flex-col h-full font-mono overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Tactical Team Net
          </span>
          <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded font-semibold">
            {session.messages.length} msgs
          </span>
        </div>

        {/* Channel Selector */}
        <div className="flex items-center space-x-1 text-[10px]">
          <button
            onClick={() => setSelectedChannel('TEAM_ALPHA')}
            className={`px-2 py-0.5 rounded transition-colors font-medium ${
              selectedChannel === 'TEAM_ALPHA'
                ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Alpha Net
          </button>
          <button
            onClick={() => setSelectedChannel('BROADCAST')}
            className={`px-2 py-0.5 rounded transition-colors font-medium ${
              selectedChannel === 'BROADCAST'
                ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Broadcast
          </button>
        </div>
      </div>

      {/* Degradation Warning Banner if Tactical Voice is severed */}
      {isNetSevered && (
        <div className="bg-rose-50 border-b border-rose-200 px-3 py-1.5 text-[10px] text-rose-800 flex items-center space-x-2">
          <WifiOff className="w-3.5 h-3.5 text-rose-600 animate-pulse shrink-0" />
          <span>Tactical net interrupted by RF jamming. Outgoing messages will fail.</span>
        </div>
      )}

      {isNetDelayed && (
        <div className="bg-amber-50 border-b border-amber-200 px-3 py-1 text-[10px] text-amber-800 flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Tactical net experiencing packet buffer latency (~30s).</span>
        </div>
      )}

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {session.messages.map(msg => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <div
              key={msg.id}
              className={`p-2.5 rounded-lg border text-xs ${
                msg.deliveryState === 'FAILED'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : isMe
                  ? 'bg-sky-50/80 border-sky-200 ml-4'
                  : 'bg-[#f8fafc] border-slate-200 mr-4'
              }`}
            >
              {/* Sender & Metadata */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1 border-b border-slate-100 pb-0.5">
                <div className="flex items-center space-x-1.5 font-semibold">
                  <span className={isMe ? 'text-sky-700' : 'text-slate-800'}>
                    {msg.senderName}
                  </span>
                  <span className="text-[9px] px-1 py-0.5 bg-slate-100 text-slate-600 rounded">
                    {msg.channel === 'BROADCAST' ? 'ALL' : 'ALPHA'}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span>T+{msg.timestamp}</span>
                  {msg.deliveryState === 'DELIVERED' && (
                    <span className="flex items-center text-emerald-600 text-[9px]" title="Delivered">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                  {msg.deliveryState === 'DELAYED' && (
                    <span className="text-amber-700 text-[9px] font-semibold">DELAYED</span>
                  )}
                  {msg.deliveryState === 'FAILED' && (
                    <span className="text-rose-700 text-[9px] font-bold">FAILED</span>
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div className="text-slate-800 text-xs font-sans leading-relaxed">
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-1.5 border-t border-slate-200 bg-[#f8fafc] flex items-center gap-1.5 overflow-x-auto text-[10px]">
        {tacticalQuickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => setInputText(prompt)}
            className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap transition-colors"
          >
            {prompt.substring(0, 24)}...
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSend} className="p-2.5 border-t border-slate-200 bg-white flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={`Transmit message on ${selectedChannel}...`}
          className="flex-1 bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 font-sans"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-bold text-xs rounded-lg flex items-center space-x-1 transition-all shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
