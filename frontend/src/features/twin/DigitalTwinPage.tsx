import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { DigitalTwinGraph, TwinNode } from '../../visualizations/DigitalTwinGraph';
import {
  BrainCircuit,
  History,
  ShieldCheck,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DigitalTwinPage: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<TwinNode | null>(null);
  const [snapshotIndex, setSnapshotIndex] = useState<number>(0);

  const { data: twin, isLoading: twinLoading } = useQuery({
    queryKey: ['current_twin'],
    queryFn: () => api.getCurrentTwin(),
  });

  const { data: history = [] } = useQuery({
    queryKey: ['twin_history'],
    queryFn: () => api.getTwinHistory(),
  });

  const activeSnapshot = history[snapshotIndex] || twin;

  if (twinLoading || !activeSnapshot) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-3 text-synapse-lime font-mono text-sm">
          <BrainCircuit className="w-5 h-5 animate-pulse text-synapse-lime" />
          <span>Synchronizing Neural Twin Topology...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-synapse-border">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-synapse-cyan uppercase mb-1">
            <BrainCircuit className="w-4 h-4" />
            <span>Living Computational Model</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-synapse-text tracking-tight">
            Digital Twin Neural Topology
          </h1>
          <p className="text-xs text-synapse-muted mt-1 max-w-2xl">
            Interactive representation of your connected capability network. Every node reflects Bayesian proficiency derived from verified evidence.
          </p>
        </div>

        {/* Snapshot Evolution History Selector */}
        {history.length > 1 && (
          <div className="flex items-center space-x-2 p-2 rounded-xl bg-synapse-surface border border-synapse-border">
            <History className="w-4 h-4 text-synapse-subtle ml-2" />
            <span className="text-xs font-mono text-synapse-subtle">Evolution Snapshot:</span>
            <select
              value={snapshotIndex}
              onChange={(e) => setSnapshotIndex(Number(e.target.value))}
              className="bg-synapse-subsurface border border-synapse-border rounded-lg text-xs font-mono px-3 py-1.5 text-synapse-text focus:outline-none focus:border-synapse-lime"
            >
              {history.map((s, idx) => (
                <option key={s.id} value={idx}>
                  {new Date(s.created_at).toLocaleDateString()} — {idx === 0 ? 'Current State' : `Snapshot #${s.id}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Snapshot Summary Banner */}
      {activeSnapshot.change_summary && (
        <div className="p-3.5 rounded-xl bg-synapse-surface border border-synapse-border text-xs font-mono flex items-center space-x-3 text-synapse-muted">
          <span className="text-synapse-lime font-bold uppercase shrink-0">Model Narration:</span>
          <span className="truncate">{activeSnapshot.change_summary}</span>
        </div>
      )}

      {/* Main Layout: Interactive Graph + Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <DigitalTwinGraph
            skillState={activeSnapshot.skill_state}
            bottlenecks={activeSnapshot.identified_bottlenecks}
            onSelectNode={(node) => setSelectedNode(node)}
            selectedNodeId={selectedNode?.id}
          />
        </div>

        {/* Right Inspector Drawer */}
        <div className="p-6 rounded-2xl bg-synapse-surface border border-synapse-border flex flex-col justify-between space-y-6">
          {selectedNode ? (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-synapse-subtle mb-1">
                  <span>Domain Inspector</span>
                  <span className="px-2 py-0.5 rounded bg-synapse-subsurface text-synapse-cyan font-bold">
                    {selectedNode.category}
                  </span>
                </div>
                <h3 className="text-xl font-display font-bold text-synapse-text">
                  {selectedNode.name}
                </h3>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-synapse-subsurface border border-synapse-border">
                  <div className="text-[10px] font-mono text-synapse-subtle uppercase">Proficiency</div>
                  <div className="text-2xl font-mono font-bold text-synapse-lime mt-1">
                    {Math.round(selectedNode.proficiency)}%
                  </div>
                  <div className="text-[10px] font-mono text-synapse-muted mt-1">
                    {selectedNode.proficiency >= 75 ? 'Proficient' : (selectedNode.proficiency >= 50 ? 'Intermediate' : 'Developing')}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-synapse-subsurface border border-synapse-border">
                  <div className="text-[10px] font-mono text-synapse-subtle uppercase">Confidence</div>
                  <div className="text-2xl font-mono font-bold text-synapse-cyan mt-1">
                    {Math.round(selectedNode.confidence)}%
                  </div>
                  <div className="text-[10px] font-mono text-synapse-muted mt-1">
                    {selectedNode.confidence >= 70 ? 'High Evidence' : 'Needs Validation'}
                  </div>
                </div>
              </div>

              {/* Bottleneck Warning */}
              {selectedNode.isBottleneck && (
                <div className="p-3 rounded-xl bg-synapse-crimson/10 border border-synapse-crimson/30 space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-synapse-crimson font-mono">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Active Concept Bottleneck</span>
                  </div>
                  <p className="text-[11px] text-synapse-muted leading-relaxed">
                    Flaws in this foundation directly limit downstream advancement in dependent data structures.
                  </p>
                </div>
              )}

              {/* Action Recommendation */}
              <div className="space-y-2 pt-4 border-t border-synapse-border">
                <div className="text-xs font-semibold text-synapse-text">Targeted Growth Action</div>
                <p className="text-xs text-synapse-muted leading-relaxed">
                  Generate verified evidence in {selectedNode.name} to increase twin certainty and unlock dependent competencies.
                </p>
                <Link
                  to="/coding"
                  className="w-full mt-3 py-2.5 rounded-lg bg-synapse-lime text-black font-semibold text-xs flex items-center justify-center space-x-2 hover:bg-synapse-lime/90 transition-colors"
                >
                  <span>Launch Assessment in {selectedNode.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-synapse-subtle">
              <BrainCircuit className="w-10 h-10 stroke-[1.5] text-synapse-border" />
              <div className="text-xs font-mono text-synapse-muted">No Node Selected</div>
              <p className="text-[11px] max-w-xs leading-relaxed">
                Click any capability node on the graph to inspect evidence provenance, confidence breakdown, and prerequisite links.
              </p>
            </div>
          )}

          {/* Quick Metrics Footer */}
          <div className="pt-4 border-t border-synapse-border text-xs font-mono text-synapse-subtle flex items-center justify-between">
            <span>Overall Model Readiness:</span>
            <span className="text-synapse-lime font-bold">{Math.round(activeSnapshot.overall_readiness)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
