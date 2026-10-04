import React, { useState } from 'react';
import { 
  Inbox, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Filter, 
  Eye, 
  Tag, 
  Info,
  Search,
  WifiOff,
  Database,
  ExternalLink
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationStore';
import { InformationReport, UserRole } from '../../types/simulation';
import { InformationProvenanceDrawer } from '../../components/InformationProvenanceDrawer';

export const InformationFeed: React.FC = () => {
  const { session, currentUser, setSelectedProvenanceReport } = useSimulation();
  const [filterDomain, setFilterDomain] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [instructorViewFilter, setInstructorViewFilter] = useState<UserRole | 'ALL'>('ALL');
  const [activeProvenanceReport, setActiveProvenanceReport] = useState<InformationReport | null>(null);

  const isInstructor = currentUser.role === 'INSTRUCTOR';

  // Determine which reports the current participant can see
  const visibleReports = session.reports.filter(report => {
    if (isInstructor) {
      if (instructorViewFilter !== 'ALL' && !report.allowedRoles.includes(instructorViewFilter)) {
        return false;
      }
    } else {
      if (!report.allowedRoles.includes(currentUser.role)) {
        return false;
      }
    }

    if (filterDomain !== 'ALL' && report.domain !== filterDomain) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        report.content.toLowerCase().includes(q) ||
        report.sourceName.toLowerCase().includes(q) ||
        report.sector.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const handleOpenProvenance = (report: InformationReport) => {
    setActiveProvenanceReport(report);
    setSelectedProvenanceReport(report);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl flex flex-col h-full font-mono overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-100 space-y-2.5 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Inbox className="w-4 h-4 text-sky-600" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Incoming Information Stream
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded font-semibold">
              {visibleReports.length} {visibleReports.length === 1 ? 'Report' : 'Reports'}
            </span>
          </div>

          {/* Instructor Perspective Toggle */}
          {isInstructor && (
            <div className="flex items-center space-x-1 text-[10px]">
              <span className="text-slate-500">View as:</span>
              <select
                value={instructorViewFilter}
                onChange={e => setInstructorViewFilter(e.target.value as any)}
                aria-label="Filter perspective by participant role"
                className="bg-white border border-slate-300 text-slate-800 rounded px-2 py-0.5 text-[10px] focus:outline-none"
              >
                <option value="ALL">All (Master)</option>
                <option value="COMMANDER">Commander</option>
                <option value="GROUND_OBSERVER">Ground Recon</option>
                <option value="AIR_OBSERVER">Air Observer</option>
                <option value="NETWORK_OBSERVER">Network Analyst</option>
              </select>
            </div>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex items-center space-x-2 text-[11px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search reports, sources, sectors..."
              className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg pl-8 pr-2 py-1.5 text-slate-800 text-[11px] placeholder-slate-400 focus:outline-none focus:border-sky-500 font-sans"
            />
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            {['ALL', 'LAND', 'AIR', 'CYBER'].map(dom => (
              <button
                key={dom}
                onClick={() => setFilterDomain(dom)}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                  filterDomain === dom
                    ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {dom}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Feed Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {visibleReports.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-lg">
            <Inbox className="w-6 h-6 text-slate-400 mb-2" />
            <div className="text-xs text-slate-700 font-semibold">No Reports Ingested For Current Scope</div>
            <div className="text-[11px] text-slate-500 max-w-xs mt-1 font-sans">
              {session.status !== 'RUNNING' 
                ? 'Simulation is currently paused. Press Play to advance scenario clock.' 
                : 'Awaiting scheduled or injected observations across domain relays.'}
            </div>
          </div>
        ) : (
          visibleReports.map(report => (
            <div
              key={report.id}
              onClick={() => handleOpenProvenance(report)}
              className={`p-3 rounded-lg border text-xs transition-all space-y-2 cursor-pointer hover:border-sky-400 ${
                report.isConflicted 
                  ? 'bg-indigo-50/70 border-indigo-200' 
                  : report.isDelayed 
                    ? 'bg-amber-50/70 border-amber-200' 
                    : 'bg-[#f8fafc] border-slate-200'
              }`}
            >
              {/* Report Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                    report.domain === 'LAND' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    report.domain === 'AIR' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                    report.domain === 'CYBER' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  }`}>
                    {report.domain}
                  </span>
                  <span className="font-bold text-slate-800 text-xs truncate max-w-[150px]">
                    {report.sourceName}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 text-[10px]">
                  <span className="text-sky-700 font-bold">T+{report.timestamp}</span>
                  <span className="text-slate-500 hover:text-sky-700 flex items-center">
                    <Database className="w-3 h-3 ml-1" />
                  </span>
                </div>
              </div>

              {/* Report Content */}
              <p className="text-slate-700 font-sans text-xs leading-relaxed">
                {report.content}
              </p>

              {/* Status / Tags Footer */}
              <div className="flex flex-wrap items-center justify-between gap-1 pt-1.5 border-t border-slate-200 text-[10px]">
                <div className="flex items-center space-x-2 text-slate-500">
                  <span className="text-slate-700 font-semibold">{report.sector}</span>
                  <span>•</span>
                  <span>Confidence: <strong className="text-slate-800">{report.confidence}</strong></span>
                </div>

                <div className="flex items-center space-x-1">
                  {report.isDelayed && (
                    <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-semibold text-[9px]">
                      Delayed
                    </span>
                  )}
                  {report.isConflicted && (
                    <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded font-semibold text-[9px]">
                      Conflicted
                    </span>
                  )}
                  <span className="text-[9px] text-sky-700 hover:underline font-semibold">
                    Provenance →
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Embedded Provenance Drawer */}
      <InformationProvenanceDrawer
        report={activeProvenanceReport}
        onClose={() => setActiveProvenanceReport(null)}
      />
    </div>
  );
};
