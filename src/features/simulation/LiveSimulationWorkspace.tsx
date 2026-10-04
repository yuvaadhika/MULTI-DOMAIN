import React, { useState } from 'react';
import { SimulationMap } from './SimulationMap';
import { OneArcSyntheticEnvironment3D } from './OneArcSyntheticEnvironment3D';
import { CommunicationStatusPanel } from './CommunicationStatusPanel';
import { InformationFeed } from './InformationFeed';
import { TeamCommunicationPanel } from './TeamCommunicationPanel';
import { DecisionPanel } from './DecisionPanel';
import { useSimulation } from '../../simulation/simulationStore';
import { Map, Radio, MessageSquare, CheckSquare, Layers, Box, Maximize2, Minimize2, Crosshair } from 'lucide-react';

export const LiveSimulationWorkspace: React.FC = () => {
  const { session, currentUser, uncertaintyMetrics } = useSimulation();
  const [mobileTab, setMobileTab] = useState<'MAP' | '3D_TERRAIN' | 'FEED' | 'COMMS' | 'DECISION'>('FEED');
  const [spatialMode, setSpatialMode] = useState<'2D_MAP' | '3D_ONEARC'>('3D_ONEARC');
  const [isFullscreen3D, setIsFullscreen3D] = useState<boolean>(false);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-2 sm:p-4 gap-3 bg-[#f8fafc]">
      {/* Top Channels Degradation Strip */}
      <CommunicationStatusPanel />

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden items-center justify-between bg-white border border-slate-200 p-1 rounded-xl shadow-xs overflow-x-auto gap-1">
        <button
          onClick={() => setMobileTab('MAP')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
            mobileTab === 'MAP'
              ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>2D Map</span>
        </button>

        <button
          onClick={() => setMobileTab('3D_TERRAIN')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
            mobileTab === '3D_TERRAIN'
              ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Box className="w-3.5 h-3.5 text-sky-600" />
          <span>3D OneArc</span>
        </button>

        <button
          onClick={() => setMobileTab('FEED')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
            mobileTab === 'FEED'
              ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Feed</span>
        </button>

        <button
          onClick={() => setMobileTab('COMMS')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
            mobileTab === 'COMMS'
              ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Comms</span>
        </button>

        <button
          onClick={() => setMobileTab('DECISION')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
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
        {mobileTab === '3D_TERRAIN' && (
          <div className="flex-1 h-full min-h-[350px]">
            <OneArcSyntheticEnvironment3D isCompact={true} />
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
        {/* Left Column (5 Cols): Spatial Environment Switcher (2D GIS <-> 3D OneArc Synthetic Battlefield) */}
        <div className="col-span-5 flex flex-col gap-2 min-h-[300px] h-full overflow-hidden">
          
          {/* Spatial Mode Toggle Bar */}
          <div className="flex items-center justify-between bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs font-mono text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500">Spatial Mode:</span>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setSpatialMode('3D_ONEARC')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center space-x-1 transition-all ${
                    spatialMode === '3D_ONEARC'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Box className="w-3 h-3" />
                  <span>3D OneArc Synthetic Terrain</span>
                </button>

                <button
                  onClick={() => setSpatialMode('2D_MAP')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center space-x-1 transition-all ${
                    spatialMode === '2D_MAP'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Map className="w-3 h-3" />
                  <span>2D Tactical GIS</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsFullscreen3D(true)}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Expand 3D Synthetic Battle Lab Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Spatial Canvas (2D or 3D) */}
          <div className="flex-1 min-h-[300px] overflow-hidden rounded-xl">
            {spatialMode === '3D_ONEARC' ? (
              <OneArcSyntheticEnvironment3D
                onFullscreenToggle={() => setIsFullscreen3D(true)}
              />
            ) : (
              <SimulationMap />
            )}
          </div>
        </div>

        {/* Center Column (3.5 Cols): Role-Filtered Information Stream */}
        <div className="col-span-3.5 flex flex-col h-full overflow-hidden">
          <InformationFeed />
        </div>

        {/* Right Column (3.5 Cols): Tactical Net & Command Decision Capture */}
        <div className="col-span-3.5 flex flex-col gap-3.5 h-full overflow-hidden">
          {/* Top Half: Team Communication Net */}
          <div className="flex-1 min-h-[190px] overflow-hidden">
            <TeamCommunicationPanel />
          </div>

          {/* Bottom Half: Command Decision Capture Panel */}
          <div className="flex-1 min-h-[220px] overflow-hidden">
            <DecisionPanel />
          </div>
        </div>
      </div>

      {/* Fullscreen 3D OneArc Synthetic Environment Modal */}
      {isFullscreen3D && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-mono">
          <div className="w-full h-full max-w-7xl max-h-[95vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl bg-white border border-slate-200">
            <OneArcSyntheticEnvironment3D
              isFullscreen={false}
              onFullscreenToggle={() => setIsFullscreen3D(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
