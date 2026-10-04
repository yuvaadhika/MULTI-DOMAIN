import React, { useState } from 'react';
import { 
  GitBranch, 
  Layers, 
  FileText, 
  AlertTriangle, 
  Radio, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  HelpCircle,
  Cpu
} from 'lucide-react';
import { DecisionEvidenceGraph as EvidenceGraphType, EvidenceNode } from '../types/simulation';

interface DecisionEvidenceGraphProps {
  graph?: EvidenceGraphType;
  onSelectNodeReport?: (sourceId: string) => void;
}

export const DecisionEvidenceGraph: React.FC<DecisionEvidenceGraphProps> = ({
  graph
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  if (!graph || !graph.nodes || graph.nodes.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-300 rounded-xl bg-slate-50">
        No evidence dependency graph compiled for this decision record.
      </div>
    );
  }

  const selectedNode = graph.nodes.find(n => n.id === selectedNodeId) || graph.nodes[0];

  const getNodeIcon = (type: EvidenceNode['type']) => {
    switch (type) {
      case 'DECISION':
        return <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />;
      case 'ACTION':
        return <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />;
      case 'REPORT':
        return <FileText className="w-3.5 h-3.5 text-emerald-600" />;
      case 'CONFLICT':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
      case 'UNCERTAINTY':
        return <Cpu className="w-3.5 h-3.5 text-rose-600" />;
      case 'MESSAGE':
        return <Radio className="w-3.5 h-3.5 text-purple-600" />;
      case 'CHANNEL':
        return <Radio className="w-3.5 h-3.5 text-amber-600" />;
      case 'RECOVERY':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  const getNodeBadgeColor = (type: EvidenceNode['type'], status?: string) => {
    if (status === 'CONFLICTED') return 'bg-amber-50 border-amber-300 text-amber-800';
    if (status === 'DELAYED') return 'bg-amber-50 border-amber-300 text-amber-800';
    if (status === 'CRITICAL' || status === 'DROPPED') return 'bg-rose-50 border-rose-300 text-rose-800';
    if (status === 'VERIFIED') return 'bg-emerald-50 border-emerald-300 text-emerald-800';

    switch (type) {
      case 'DECISION':
        return 'bg-sky-50 border-sky-300 text-sky-800';
      case 'ACTION':
        return 'bg-blue-50 border-blue-300 text-blue-800';
      case 'REPORT':
        return 'bg-emerald-50 border-emerald-300 text-emerald-800';
      case 'CONFLICT':
        return 'bg-amber-50 border-amber-300 text-amber-800';
      case 'UNCERTAINTY':
        return 'bg-rose-50 border-rose-300 text-rose-800';
      case 'MESSAGE':
        return 'bg-purple-50 border-purple-300 text-purple-800';
      case 'RECOVERY':
        return 'bg-emerald-50 border-emerald-300 text-emerald-800';
      default:
        return 'bg-slate-50 border-slate-300 text-slate-700';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 font-mono select-none text-slate-800 shadow-xs">
      {/* Title Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
        <div className="flex items-center space-x-2">
          <GitBranch className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-bold text-slate-900">
            {graph.decisionTitle || 'Decision Evidence Graph'}
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-semibold">
          {graph.nodes.length} Nodes • {graph.edges.length} Dependencies
        </span>
      </div>

      {/* Visual DAG Flow Chart */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
          Evidence Reconstruction Flow (Click any node to inspect)
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 py-3">
          {graph.nodes.map(node => {
            const isSelected = selectedNode?.id === node.id;
            return (
              <button
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-xs font-mono transition-all transform hover:scale-105 text-left ${getNodeBadgeColor(node.type, node.status)} ${
                  isSelected ? 'ring-2 ring-sky-500 shadow-md font-bold' : 'opacity-90 hover:opacity-100'
                }`}
              >
                <span>{getNodeIcon(node.type)}</span>
                <div>
                  <div className="font-bold text-[11px] leading-tight">
                    {node.label}
                  </div>
                  {node.timestamp && (
                    <div className="text-[9px] opacity-75">
                      T+{node.timestamp}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Edge Dependencies Summary */}
        <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex flex-wrap gap-2">
          {graph.edges.map((edge, idx) => {
            const fromNode = graph.nodes.find(n => n.id === edge.from);
            const toNode = graph.nodes.find(n => n.id === edge.to);
            return (
              <span key={idx} className="px-2 py-0.5 bg-white rounded-md border border-slate-200 shadow-xs flex items-center space-x-1">
                <span className="text-slate-700 font-semibold">{fromNode?.label || edge.from}</span>
                <span className="text-sky-600 font-bold">→</span>
                <span className="text-slate-700 font-semibold">{toNode?.label || edge.to}</span>
                {edge.label && <span className="text-slate-400">({edge.label})</span>}
              </span>
            );
          })}
        </div>
      </div>

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs shadow-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <span className="text-slate-500 text-[11px] uppercase">Node Details:</span>
              <span className="font-bold text-slate-900">{selectedNode.label}</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getNodeBadgeColor(selectedNode.type, selectedNode.status)}`}>
              {selectedNode.type} {selectedNode.status ? `• ${selectedNode.status}` : ''}
            </span>
          </div>

          <p className="text-slate-700 font-sans text-xs leading-relaxed">
            {selectedNode.details}
          </p>

          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
            <span>Timestamp: {selectedNode.timestamp ? `T+${selectedNode.timestamp}` : 'Exercise Phase'}</span>
            {selectedNode.confidence && (
              <span>Confidence: <strong className="text-sky-700 font-semibold">{selectedNode.confidence}</strong></span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
