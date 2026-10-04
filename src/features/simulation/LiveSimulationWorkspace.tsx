import React, { useState } from 'react';
import { SimulationMap } from './SimulationMap';
import { CommunicationStatusPanel } from './CommunicationStatusPanel';
import { InformationFeed } from './InformationFeed';
import { TeamCommunicationPanel } from './TeamCommunicationPanel';
import { DecisionPanel } from './DecisionPanel';
import { useSimulation } from '../../simulation/simulationStore';
import { Map, Radio, MessageSquare, CheckSquare, Layers } from 'lucide-react';

export const LiveSimulationWorkspace: React.FC = () => {
  const { session, currentUser, uncertaintyMetrics } = useSimulation();
  const [mobileTab, setMobileTab] = useState<'MAP' | 'FEED' | 'COMMS' | 'DECISION'>('FEED');

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-2 sm:p-4 gap-3 bg-[#f8fafc]">
      {/* Top Channels Degradation Strip */}
      <CommunicationStatusPanel />

      {/* Mobile Tab Switcher (Visible only on small devices to prevent clumsy layout) */}
      <div className="flex lg:hidden items-center justify-between bg-white border border-slate-200 p-1 rounded-xl shadow-xs">
        <button
          onClick={() => setMobileTab('MAP')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'MAP'
              ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>Map</span>
        </button>

        <button
          onClick={() => setMobileTab('FEED')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'FEED'
              ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Intel Feed</span>
        </button>

        <button
          onClick={() => setMobileTab('COMMS')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'COMMS'
              ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Team Comms</span>
        </button>

        <button
          onClick={() => setMobileTab('DECISION')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'DECISION'
              ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Decision</span>
        </button>
      </div>

      {/* Mobile Single View Container */}
      <div className="flex-1 lg:hidden overflow-hidden flex flex-col">
        {mobileTab === 'MAP' && (
          <div className="flex-1 h-full min-h-[350px]">
            <SimulationMap />
          </div>
        )}
        {mobileTab === 'FEED' && (
          <div className="flex-1 h-full overflow-hidden">
            <InformationFeed />
          </div>
        )}
        {mobileTab === 'COMMS' && (
          <div className="flex-1 h-full overflow-hidden">
            <TeamCommunicationPanel />
          </div>
        )}
        {mobileTab === 'DECISION' && (
          <div className="flex-1 h-full overflow-hidden">
            <DecisionPanel />
          </div>
        )}
      </div>

      {/* Desktop & Tablet Multi-Column Responsive Workspace */}
      <div className="hidden lg:grid flex-1 grid-cols-12 gap-3.5 min-h-0 overflow-hidden">
        {/* Left Column (4 Cols): Operational Map & Spatial Telemetry */}
        <div className="col-span-4 flex flex-col gap-3 min-h-[300px] h-full overflow-hidden">
          <div className="flex-1 min-h-[280px]">
            <SimulationMap />
          </div>
        </div>

        {/* Center Column (4 Cols): Role-Filtered Information Stream */}
        <div className="col-span-4 flex flex-col h-full overflow-hidden">
          <InformationFeed />
        </div>

        {/* Right Column (4 Cols): Tactical Net & Command Decision Capture */}
        <div className="col-span-4 flex flex-col gap-3.5 h-full overflow-hidden">
          {/* Top Half: Team Communication Net */}
          <div className="flex-1 min-h-[200px] overflow-hidden">
            <TeamCommunicationPanel />
          </div>

          {/* Bottom Half: Command Decision Capture Panel */}
          <div className="flex-1 min-h-[220px] overflow-hidden">
            <DecisionPanel />
          </div>
        </div>
      </div>
    </div>
  );
};
