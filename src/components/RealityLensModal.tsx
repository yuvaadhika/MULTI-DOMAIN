import React, { useState } from 'react';
import { RealityLensComparison, UserRole } from '../types/simulation';
import { SEED_REALITY_LENS_COMPARISONS } from '../data/seedData';
import { Eye, Shield, Users, User, GitCommit, AlertTriangle, CheckCircle2, X, ChevronRight, Layers, Radio } from 'lucide-react';

interface RealityLensModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRole?: UserRole;
  currentSimulationSec?: number;
}

export const RealityLensModal: React.FC<RealityLensModalProps> = ({
  isOpen,
  onClose,
  selectedRole = 'COMMANDER'
}) => {
  const [activeComparisonIndex, setActiveComparisonIndex] = useState(0);
  const comparisons = SEED_REALITY_LENS_COMPARISONS;
  const current = comparisons[activeComparisonIndex] || comparisons[0];

  if (!isOpen || !current) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in font-mono">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-50 border border-sky-200 rounded-lg text-sky-700">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  Signature Innovation
                </span>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-wide">
                  REALITY LENS — 3-WAY SITUATIONAL TRIANGULATION
                </h2>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-sans">
                What Actually Happened ➔ What the Team Knew ➔ What the Individual Knew ➔ Why the Decision Was Made
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Event Selector */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-lg shadow-xs">
              {comparisons.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => setActiveComparisonIndex(idx)}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                    activeComparisonIndex === idx
                      ? 'bg-sky-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  T+{c.timestamp} ({c.sector})
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 bg-slate-50">
          
          {/* Active Case Banner */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-xs">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Audited Simulation Event • T+{current.timestamp} ({current.simulationSec}s)
              </span>
              <h3 className="text-base font-bold text-slate-900">{current.subject}</h3>
              <span className="text-xs text-slate-600">Sector: <strong className="text-sky-700">{current.sector}</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[11px] text-slate-500 font-mono">Team Asymmetry</div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  {current.teamKnowledge.asymmetryLevel} ASYMMETRY
                </span>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-500 font-mono">Target Role Evaluated</div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                  {current.individualKnowledge.role}
                </span>
              </div>
            </div>
          </div>

          {/* 3-Column Triangulation Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* 1. Ground Truth (What Actually Happened) */}
            <div className="bg-white border-2 border-emerald-200 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-emerald-100 mb-4">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider font-mono">1. Ground Truth</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                    MASTER TRUTH
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-500 font-mono uppercase">Actual Physical Event</label>
                    <p className="text-sm font-semibold text-slate-900">{current.groundTruth.event}</p>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 font-mono uppercase">Master Engine Verified Details</label>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-sans">
                      {current.groundTruth.details}
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 font-mono uppercase">Actual Entities Involved</label>
                    <p className="text-xs text-emerald-700 font-mono font-semibold">{current.groundTruth.actualUnitsInvolved}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">Real Threat Level</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {current.groundTruth.realThreatLevel} THREAT
                </span>
              </div>
            </div>

            {/* 2. Team Knowledge (What the Team Knew) */}
            <div className="bg-white border-2 border-amber-200 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-amber-100 mb-4">
                  <div className="flex items-center gap-2 text-amber-700">
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider font-mono">2. Team Knowledge</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                    AGGREGATED
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-500 font-mono uppercase">Multi-Domain Composite Intel</label>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-sans">
                      {current.teamKnowledge.combinedSummary}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-mono block">Available Reports</span>
                      <strong className="text-slate-900 font-mono">{current.teamKnowledge.reportsAvailableToTeam} Dispatched</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-mono block">Cross-Verified</span>
                      <strong className={current.teamKnowledge.crossDomainVerified ? 'text-emerald-700 font-mono' : 'text-rose-700 font-mono'}>
                        {current.teamKnowledge.crossDomainVerified ? 'YES' : 'NO (Unverified)'}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 font-mono uppercase">Conflicting Sources</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {current.teamKnowledge.conflictingSources.map((s, idx) => (
                        <span key={idx} className="text-[11px] font-mono px-2 py-0.5 bg-rose-50 text-rose-700 rounded border border-rose-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">Team Sync Level</span>
                <span className="text-xs font-bold text-amber-700 font-mono">
                  {current.teamKnowledge.asymmetryLevel} DIVERGENCE
                </span>
              </div>
            </div>

            {/* 3. Individual Knowledge (What the Individual Knew) */}
            <div className="bg-white border-2 border-sky-200 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-sky-100 mb-4">
                  <div className="flex items-center gap-2 text-sky-700">
                    <User className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider font-mono">3. Trainee Local Feed</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                    {current.individualKnowledge.role}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-500 font-mono uppercase">Local Perceived Situation</label>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-sans">
                      "{current.individualKnowledge.perceivedSituation}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-mono block">Delayed Feeds</span>
                      <strong className="text-amber-700 font-mono">{current.individualKnowledge.delayedReportsCount} delayed</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-mono block">Dropped Feeds</span>
                      <strong className="text-rose-700 font-mono">{current.individualKnowledge.droppedFeedsCount} dropped</strong>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 font-mono uppercase">Critical Blindspots</label>
                    <ul className="space-y-1 mt-1 font-sans">
                      {current.individualKnowledge.criticalInformationBlindspots.map((b, idx) => (
                        <li key={idx} className="text-[11px] text-rose-700 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 mt-0.5 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">Trainee Confidence</span>
                <span className="text-xs font-bold text-sky-700 font-mono">
                  {current.individualKnowledge.perceivedConfidence} CONFIDENCE
                </span>
              </div>
            </div>

          </div>

          {/* 4. Cognitive Bridge / Why the Decision Was Made */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-2 text-sky-700 pb-3 border-b border-slate-200 mb-4">
              <GitCommit className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
                4. Cognitive Bridge: Why the Decision Was Made
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-slate-500 uppercase">Action Executed</span>
                <p className="text-xs font-semibold text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200 font-sans">
                  {current.decisionRationaleBridge.decisionAction}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono text-slate-500 uppercase">Decision Rationale</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 font-sans leading-relaxed">
                  {current.decisionRationaleBridge.decisionRationale}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono text-amber-700 uppercase font-semibold">Degradation Distortion Factor</span>
                <p className="text-xs text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-200 font-sans leading-relaxed">
                  {current.decisionRationaleBridge.cognitiveDistortionFactor}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Instructional Verdict:</span>
                <span className={`font-semibold px-2 py-0.5 rounded border ${
                  current.decisionRationaleBridge.justifiedGivenData
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {current.decisionRationaleBridge.justifiedGivenData
                    ? 'TACTICALLY JUSTIFIED GIVEN LOCAL DATA'
                    : 'PREMATURE COMMITMENT UNDER UNCERTAINTY'}
                </span>
              </div>
              <span className="text-slate-500 text-[11px]">
                DSS Evaluation: Demonstrates how latency directly shapes commander risk assessment.
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono text-[11px]">
            SENTINEL-X REALITY LENS v2.4 • DEFENCE SERVICES STAFF COLLEGE COGNITIVE AUDIT
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors shadow-xs"
          >
            Close Reality Lens
          </button>
        </div>

      </div>
    </div>
  );
};
