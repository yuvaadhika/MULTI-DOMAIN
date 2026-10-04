import React from 'react';
import { ResilienceScoreMetrics } from '../../types/simulation';
import { SEED_RESILIENCE_SCORE } from '../../data/seedData';
import { Award, ShieldCheck, Activity, Zap, Users, RotateCcw, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface ResilienceScoreBreakdownProps {
  metrics?: ResilienceScoreMetrics;
}

export const ResilienceScoreBreakdown: React.FC<ResilienceScoreBreakdownProps> = ({
  metrics = SEED_RESILIENCE_SCORE
}) => {
  const radarData = [
    { subject: 'Adaptation Agility', score: metrics.dimensions.adaptationAgility.score, fullMark: 100 },
    { subject: 'Verification Rigor', score: metrics.dimensions.informationVerification.score, fullMark: 100 },
    { subject: 'Intent Adherence', score: metrics.dimensions.intentAdherenceUnderBlackout.score, fullMark: 100 },
    { subject: 'Recovery Velocity', score: metrics.dimensions.degradationRecoveryVelocity.score, fullMark: 100 },
    { subject: 'Cross-Domain Sync', score: metrics.dimensions.crossDomainCoordination.score, fullMark: 100 }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-6 shadow-xs font-mono">
      
      {/* Header & Overall Gauge */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                Signature Innovation 5
              </span>
              <h3 className="text-base font-bold text-slate-900 tracking-wide">
                OPERATIONAL RESILIENCE SCORECARD (DSSC BENCHMARK)
              </h3>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 font-sans">
              Multi-dimensional evaluation of decision quality, team coordination, and recovery under severe EW degradation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-lg shadow-xs">
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Resilience Index</span>
            <span className="text-2xl font-black font-mono text-emerald-700 leading-none">
              {metrics.overallScore} <span className="text-xs text-slate-400">/ 100</span>
            </span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Classification</span>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              {metrics.grade}
            </span>
          </div>
        </div>
      </div>

      {/* Radar Chart + 5-Dimension Meters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Radar Chart (Left 5 Cols) */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-3 h-[280px] flex flex-col items-center justify-center shadow-inner">
          <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
            Resilience Competency Radar
          </span>
          <ResponsiveContainer width="100%" height="90%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#cbd5e1" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10, fontFamily: 'monospace' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
              <Radar
                name="Resilience Score"
                dataKey="score"
                stroke="#0284c7"
                fill="#38bdf8"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 5 Dimensional Progress Bars (Right 7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          {Object.entries(metrics.dimensions).map(([key, dim]) => (
            <div key={key} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900">{dim.name}</span>
                <span className="text-xs font-mono font-bold text-sky-700">{dim.score}%</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    dim.score >= 90 ? 'bg-emerald-600' :
                    dim.score >= 75 ? 'bg-sky-600' : 'bg-amber-600'
                  }`}
                  style={{ width: `${dim.score}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-600 font-sans leading-tight">
                {dim.instructionalInsight}
              </p>
            </div>
          ))}
        </div>

      </div>

      {/* Strengths & Vulnerabilities Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
        
        {/* Strengths */}
        <div className="bg-white border border-emerald-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center gap-2 text-emerald-700 font-bold font-mono text-[11px] uppercase mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Demonstrated Operational Strengths</span>
          </div>
          <ul className="space-y-1.5">
            {metrics.strengths.map((str, idx) => (
              <li key={idx} className="text-slate-700 flex items-start gap-1.5">
                <span className="text-emerald-700 font-bold font-mono">✓</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Vulnerabilities */}
        <div className="bg-white border border-amber-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center gap-2 text-amber-700 font-bold font-mono text-[11px] uppercase mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Uncertainty Vulnerability Windows</span>
          </div>
          <ul className="space-y-1.5">
            {metrics.vulnerabilitiesUnderUncertainty.map((vuln, idx) => (
              <li key={idx} className="text-slate-700 flex items-start gap-1.5">
                <span className="text-amber-700 font-bold font-mono">!</span>
                <span>{vuln}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Official DSSC Assessment Note */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <span className="text-[10px] font-mono uppercase text-sky-700 font-bold block mb-0.5">
            Defence Services Staff College (DSSC) Assessment Verdict
          </span>
          <p className="text-slate-700 italic font-sans">
            "{metrics.dsscAssessmentNote}"
          </p>
        </div>
      </div>

    </div>
  );
};
