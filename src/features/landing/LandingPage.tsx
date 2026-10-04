import React from 'react';
import { 
  Radio, 
  Shield, 
  Activity, 
  Cpu, 
  Layers, 
  FileText, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  Zap,
  Users,
  Compass,
  Lock,
  ChevronRight,
  Database,
  GitBranch,
  RotateCcw,
  Clock,
  Eye,
  Award,
  Network
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationStore';
import { SEED_USERS } from '../../data/seedData';

export const LandingPage: React.FC = () => {
  const { setCurrentView, setCurrentUser, startGuidedDemo } = useSimulation();

  const handleEnterSimulation = (role: 'COMMANDER' | 'INSTRUCTOR' | 'OBSERVER') => {
    if (role === 'INSTRUCTOR') {
      setCurrentUser(SEED_USERS[0]);
      setCurrentView('INSTRUCTOR_DASHBOARD');
    } else if (role === 'OBSERVER') {
      setCurrentUser(SEED_USERS[4]);
      setCurrentView('LIVE_SIMULATION');
    } else {
      setCurrentUser(SEED_USERS[2]); // Capt. Jonathan Thorne (Commander)
      setCurrentView('LIVE_SIMULATION');
    }
  };

  const infoLoopSteps = [
    { label: 'Information Ingest', sub: 'Multi-domain sensory inputs' },
    { label: 'Degradation', sub: 'Latency, dropouts, spoofing' },
    { label: 'Uncertainty', sub: 'Information Debt spike' },
    { label: 'Team Coordination', sub: 'Cross-domain verification' },
    { label: 'Decision Commit', sub: 'Command directive with fallback' },
    { label: 'Decision Rationale', sub: 'Captured mental model' },
    { label: 'Context Snapshot', sub: 'Exact state reconstruction' },
    { label: 'Cognitive Analysis', sub: 'Evidence graphs & calibration' },
    { label: 'After Action Review', sub: 'Replay & DSSC evaluation' }
  ];

  const innovations = [
    {
      title: 'Reality Lens (3-Way Triangulation)',
      desc: 'Compares Master Ground Truth vs Team Aggregated Knowledge vs Individual Local Feed to uncover why decisions occurred.',
      icon: <Eye className="w-4 h-4 text-sky-400" />,
      tag: 'Innovation 1'
    },
    {
      title: 'Decision Receipts & Fallback Plans',
      desc: 'Captures Action, Rationale, Confidence, Fallback Contingencies, and Assumed Reality with tamper-proof SHA-256 seals.',
      icon: <FileText className="w-4 h-4 text-amber-400" />,
      tag: 'Innovation 2'
    },
    {
      title: 'Communication Trace (Packet Wire Tap)',
      desc: 'Hop-by-hop transmission lifecycle tracking delayed, dropped, and EW-altered corrupted coordinates.',
      icon: <Network className="w-4 h-4 text-indigo-400" />,
      tag: 'Innovation 3'
    },
    {
      title: 'Commander’s Intent Protocol',
      desc: 'Mission Command doctrine (Auftragstaktik) with pre-delegated autonomous action rules under 100% EW blackout.',
      icon: <Compass className="w-4 h-4 text-amber-400" />,
      tag: 'Innovation 4'
    },
    {
      title: 'Operational Resilience Scorecard',
      desc: 'Algorithmic 5-dimension radar measuring adaptation agility, verification rigor, and recovery velocity for DSSC.',
      icon: <Award className="w-4 h-4 text-emerald-400" />,
      tag: 'Innovation 5'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto font-mono select-none bg-[#f8fafc] text-slate-900">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-8 pt-10 sm:pt-14 pb-14 max-w-6xl mx-auto border-b border-slate-200">
        <div className="space-y-6 max-w-3xl">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold font-mono tracking-widest text-sky-700 uppercase">
              WYNDRA
            </span>
            <span className="text-slate-300 font-bold">|</span>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-mono">
              <Radio className="w-3.5 h-3.5 text-sky-600" />
              <span>SENTINEL-X • Decision Training Platform</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Decision-Making When Information Fails
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-sans leading-relaxed">
            A controlled simulation environment for training small teams and sub-unit commanders to coordinate, reason, and decide under severely degraded communication conditions.
          </p>

          <div className="text-xs text-slate-500 font-mono">
            Designed and engineered by <strong className="text-slate-800">WYNDRA</strong> for the Ministry of Defence & Defence Services Staff College evaluation.
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => handleEnterSimulation('COMMANDER')}
              className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-2 transition-all shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Enter Simulation</span>
            </button>

            <button
              onClick={startGuidedDemo}
              className="px-5 py-2.5 rounded-lg bg-white hover:bg-sky-50 border border-sky-300 text-sky-700 font-bold text-xs flex items-center space-x-2 transition-all shadow-xs"
            >
              <Activity className="w-4 h-4 text-sky-600" />
              <span>Launch Demo (Operation Meridian)</span>
            </button>

            <button
              onClick={() => setCurrentView('SESSION_LOBBY')}
              className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center space-x-2 transition-colors shadow-xs"
            >
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Session Lobby (M7K-42Q)</span>
            </button>

            <button
              onClick={() => handleEnterSimulation('INSTRUCTOR')}
              className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center space-x-2 transition-colors shadow-xs"
            >
              <span>Instructor C2</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* The Core Information Training Loop */}
        <div className="mt-12 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>Core Non-Combat Information & Decision Cycle</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              9-Stage Cognitive Training Protocol
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2 text-center text-xs">
            {infoLoopSteps.map((step, idx) => (
              <div
                key={idx}
                className="bg-[#f8fafc] border border-slate-200 p-3 rounded-lg flex flex-col justify-between space-y-1.5"
              >
                <div className="text-[9px] text-sky-700 font-bold uppercase font-mono">
                  Step 0{idx + 1}
                </div>
                <div className="font-bold text-slate-800 text-[11px] leading-tight">
                  {step.label}
                </div>
                <div className="text-[9px] text-slate-500 font-sans leading-snug">
                  {step.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5 Core Innovations Showcase Cards */}
        <div className="mt-12 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Shield className="w-4 h-4 text-sky-600" />
              <span>5 Signature Training Innovations</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-500">Defence Services Staff College Benchmarks</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {innovations.map((inv, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 hover:border-sky-300 p-4 rounded-xl space-y-2.5 transition-all shadow-xs hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-bold uppercase">
                    {inv.tag}
                  </span>
                  <div className="p-1.5 bg-slate-50 rounded-md border border-slate-200">
                    {inv.icon}
                  </div>
                </div>

                <h3 className="text-xs font-bold text-slate-900">{inv.title}</h3>
                <p className="text-xs text-slate-600 font-sans leading-relaxed">
                  {inv.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 max-w-6xl mx-auto text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4 font-mono">
        <div>
          SENTINEL-X v2.4 • WYNDRA Engineering Simulation Framework
        </div>
        <div>
          Ministry of Defence (MoD) • Theme: Smart Automation
        </div>
      </footer>
    </div>
  );
};
