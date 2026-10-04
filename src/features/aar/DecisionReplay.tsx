import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  Clock, 
  Radio, 
  Inbox, 
  CheckSquare, 
  Eye, 
  AlertTriangle,
  Layers,
  ChevronRight,
  ExternalLink,
  Database
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationStore';
import { SimulationMap } from '../simulation/SimulationMap';
import { DecisionRecord, InformationReport } from '../../types/simulation';
import { DecisionContextModal } from '../instructor/DecisionContextModal';
import { InformationProvenanceDrawer } from '../../components/InformationProvenanceDrawer';

export const DecisionReplay: React.FC = () => {
  const { aarSession, formatSimTime } = useSimulation();

  const totalSec = Math.max(360, aarSession.simulationSec);
  const [currentSec, setCurrentSec] = useState<number>(120);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 1 | 2 | 4>(1);

  const [selectedDecision, setSelectedDecision] = useState<DecisionRecord | null>(null);
  const [selectedReport, setSelectedReport] = useState<InformationReport | null>(null);

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSec(prev => {
        if (prev >= totalSec) {
          setIsPlaying(false);
          return totalSec;
        }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, totalSec, playbackSpeed]);

  // Filter items that occurred up to currentSec
  const visibleReportsAtTime = aarSession.reports.filter(r => r.simulationSec <= currentSec);
  const visibleDecisionsAtTime = aarSession.decisions.filter(d => d.simulationSec <= currentSec);

  // Channel states at currentSec
  const isAirDelayed = currentSec >= 90 && currentSec <= 270;
  const isTeamInterrupted = currentSec >= 210 && currentSec <= 250;
  const isConflictActive = currentSec >= 160 && currentSec <= 300;

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 font-mono select-none max-w-6xl mx-auto bg-slate-50 min-h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <RotateCcw className="w-5 h-5 text-sky-600" />
            <span>SYNCHRONIZED DECISION REPLAY ENGINE</span>
          </h1>
          <p className="text-xs text-slate-600 font-sans mt-0.5">
            Step through historical exercise timestamps to audit sensor availability, communication degradation, and command decisions.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-lg border border-slate-200 shadow-xs">
          <Clock className="w-4 h-4 text-sky-600" />
          <span className="text-xs text-slate-500">Replay Clock:</span>
          <span className="text-base font-bold text-slate-900">
            T+{formatSimTime(currentSec)}
          </span>
          <span className="text-xs text-slate-500">/ {formatSimTime(totalSec)}</span>
        </div>
      </div>

      {/* Replay Scrubber & Playback Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3.5 shadow-xs">
        {/* Scrubber Range Input */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <span>Exercise Start (00:00)</span>
            <span className="text-sky-700 font-bold">Scrubber: T+{formatSimTime(currentSec)}</span>
            <span>Concluded ({formatSimTime(totalSec)})</span>
          </div>
          <input
            type="range"
            min={0}
            max={totalSec}
            value={currentSec}
            onChange={e => setCurrentSec(Number(e.target.value))}
            className="w-full accent-sky-600 bg-slate-200 h-2 rounded-lg cursor-pointer"
          />
        </div>

        {/* Playback Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentSec(Math.max(0, currentSec - 10))}
              title="10s Back"
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs flex items-center space-x-1 transition-colors shadow-xs"
            >
              <SkipBack className="w-3.5 h-3.5" />
              <span>-10s</span>
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play Replay'}</span>
            </button>

            <button
              onClick={() => setCurrentSec(Math.min(totalSec, currentSec + 10))}
              title="10s Forward"
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs flex items-center space-x-1 transition-colors shadow-xs"
            >
              <span>+10s</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentSec(0);
              }}
              title="Reset to 00:00"
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-300 transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-500 text-[11px]">Speed:</span>
            {([0.5, 1, 2, 4] as const).map(s => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  playbackSpeed === s ? 'bg-sky-50 text-sky-700 border border-sky-300 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Synchronized Tri-Panel Snapshot at Selected Timestamp */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Map & Channel Status at this second */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-xs">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-1.5">
              <Radio className="w-4 h-4 text-sky-600" />
              <span>Channel States at T+{formatSimTime(currentSec)}</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-700">Ground Observation Net:</span>
                <span className="text-emerald-700 font-bold">NORMAL</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-700">Aerial Surveillance Uplink:</span>
                <span className={isAirDelayed ? 'text-amber-700 font-bold animate-pulse' : 'text-emerald-700 font-bold'}>
                  {isAirDelayed ? 'DELAYED (45s buffer)' : 'NORMAL'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-700">Inter-Unit Tactical Net:</span>
                <span className={isTeamInterrupted ? 'text-rose-700 font-bold animate-pulse' : 'text-emerald-700 font-bold'}>
                  {isTeamInterrupted ? 'INTERRUPTED' : 'NORMAL'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-700">Information Environment:</span>
                <span className={isConflictActive ? 'text-purple-700 font-bold' : 'text-slate-700'}>
                  {isConflictActive ? 'CONFLICTED' : 'NOMINAL'}
                </span>
              </div>
            </div>
          </div>

          <div className="h-56 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
            <SimulationMap />
          </div>
        </div>

        {/* Center: Information Feeds Visible at this second */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3 flex flex-col h-full max-h-[500px] shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-1.5">
              <Inbox className="w-4 h-4 text-sky-600" />
              <span>Intel Delivered by T+{formatSimTime(currentSec)}</span>
            </div>
            <span className="text-[10px] text-sky-700 font-bold px-2 py-0.5 rounded bg-sky-50 border border-sky-200">
              {visibleReportsAtTime.length} Available
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {visibleReportsAtTime.length === 0 ? (
              <div className="text-slate-400 text-xs text-center py-8 italic">
                No intelligence reports received before T+{formatSimTime(currentSec)}.
              </div>
            ) : (
              visibleReportsAtTime.map(rep => (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReport(rep)}
                  className={`p-3 rounded-lg border text-xs space-y-1.5 cursor-pointer transition-colors shadow-xs ${
                    rep.isConflicted ? 'bg-purple-50 border-purple-200 hover:border-purple-300' :
                    rep.isDelayed ? 'bg-amber-50 border-amber-200 hover:border-amber-300' :
                    'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-slate-900">[{rep.domain}] {rep.sourceName}</span>
                    <span className="text-sky-700 font-bold">T+{rep.timestamp}</span>
                  </div>
                  <div className="text-slate-700 font-sans text-xs">{rep.content}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Decisions & Messages at this second */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3 flex flex-col h-full max-h-[500px] shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-1.5">
              <CheckSquare className="w-4 h-4 text-sky-600" />
              <span>Decisions Reconstructed</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
              {visibleDecisionsAtTime.length} Logged
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5">
            {visibleDecisionsAtTime.length === 0 ? (
              <div className="text-slate-400 text-xs text-center py-8 italic">
                Zero decisions submitted prior to T+{formatSimTime(currentSec)}.
              </div>
            ) : (
              visibleDecisionsAtTime.map(dec => (
                <div
                  key={dec.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{dec.action}</span>
                    <span className="text-sky-700 text-[10px] font-bold">T+{dec.timestamp}</span>
                  </div>
                  <div className="text-slate-600 text-[11px] font-sans italic">
                    "{dec.rationale}"
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1.5 border-t border-slate-200 flex justify-between items-center">
                    <span>By {dec.participantName}</span>
                    <button
                      onClick={() => setSelectedDecision(dec)}
                      className="text-sky-700 hover:underline flex items-center space-x-0.5 font-bold"
                    >
                      <span>Audit Context</span>
                      <ExternalLink className="w-2.5 h-2.5 ml-1" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Decision Context Modal */}
      {selectedDecision && (
        <DecisionContextModal
          decision={selectedDecision}
          onClose={() => setSelectedDecision(null)}
        />
      )}

      {/* Information Provenance Drawer */}
      <InformationProvenanceDrawer
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
};
