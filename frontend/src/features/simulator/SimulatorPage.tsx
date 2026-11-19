import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';
import { FutureSelfSimulation } from '../../types';
import {
  Zap,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Layers,
  Compass
} from 'lucide-react';

export const SimulatorPage: React.FC = () => {
  const [targetRole, setTargetRole] = useState<string>('backend-developer');
  const [hypotheticalSkills, setHypotheticalSkills] = useState<Record<string, number>>({
    trees: 75,
    graphs: 70,
    dsa: 75,
    'system-design': 65,
  });

  const [simulationResult, setSimulationResult] = useState<FutureSelfSimulation | null>(null);

  const simulateMutation = useMutation({
    mutationFn: () => api.simulateFutureSelf(hypotheticalSkills, targetRole),
    onSuccess: (data) => {
      setSimulationResult(data);
    },
  });

  const handleSliderChange = (slug: string, value: number) => {
    setHypotheticalSkills((prev) => ({
      ...prev,
      [slug]: value,
    }));
  };

  const handleReset = () => {
    setHypotheticalSkills({
      trees: 75,
      graphs: 70,
      dsa: 75,
      'system-design': 65,
    });
    setSimulationResult(null);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-synapse-border">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-synapse-lime uppercase mb-1">
            <Zap className="w-4 h-4" />
            <span>Isolated Hypothetical State Laboratory</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-synapse-text tracking-tight">
            Future Self Capability Simulator
          </h1>
          <p className="text-xs text-synapse-muted mt-1 max-w-2xl">
            Simulate the multi-criteria impact of prospective learning investments. Models projected role alignment gains without modifying your persistent Digital Twin.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-3 py-1.5 rounded-lg bg-synapse-surface border border-synapse-border text-xs font-mono text-synapse-muted flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-synapse-cyan animate-pulse" />
            <span>State: Sandboxed Memory</span>
          </div>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-synapse-surface border border-synapse-border text-synapse-subtle hover:text-synapse-text"
            title="Reset parameters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Hypothetical Sliders */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-synapse-surface border border-synapse-border space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-synapse-border">
            <h2 className="text-sm font-display font-bold text-synapse-text">Hypothetical Interventions</h2>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="bg-synapse-subsurface border border-synapse-border rounded-lg text-xs font-mono px-2.5 py-1 text-synapse-text focus:outline-none focus:border-synapse-lime"
            >
              <option value="backend-developer">Backend Developer</option>
              <option value="full-stack-developer">Full Stack Developer</option>
              <option value="ai-engineer">AI Engineer</option>
              <option value="software-engineer">Software Engineer</option>
            </select>
          </div>

          <div className="space-y-5">
            {[
              { slug: 'trees', name: 'Trees & BST Traversal', current: 31 },
              { slug: 'graphs', name: 'Graph Algorithms & Cycles', current: 28 },
              { slug: 'dsa', name: 'General DSA Problem Solving', current: 42 },
              { slug: 'system-design', name: 'Distributed System Design', current: 35 },
            ].map((item) => (
              <div key={item.slug} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-synapse-text">{item.name}</span>
                  <div className="flex items-center space-x-2 font-mono text-[11px]">
                    <span className="text-synapse-subtle">Baseline: {item.current}%</span>
                    <span>&bull;</span>
                    <span className="text-synapse-lime font-bold">
                      Hypothetical: {hypotheticalSkills[item.slug]}%
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min="30"
                  max="95"
                  value={hypotheticalSkills[item.slug] || 50}
                  onChange={(e) => handleSliderChange(item.slug, Number(e.target.value))}
                  className="w-full accent-synapse-lime cursor-pointer bg-synapse-subsurface h-2 rounded-lg"
                />
              </div>
            ))}
          </div>

          <button
            onClick={() => simulateMutation.mutate()}
            disabled={simulateMutation.isPending}
            className="w-full py-3 rounded-xl bg-synapse-lime text-black font-semibold text-xs flex items-center justify-center space-x-2 hover:bg-synapse-lime/90 transition-colors shadow-lg shadow-synapse-lime/20"
          >
            {simulateMutation.isPending ? (
              <span>Computing Multi-Criteria Projections...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Run Hypothetical Simulation</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Simulation Telemetry Projection */}
        <div className="lg:col-span-7 space-y-6">
          {simulationResult ? (
            <div className="p-6 rounded-2xl bg-synapse-surface border border-synapse-border space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-synapse-border">
                <div className="flex items-center space-x-2 text-xs font-mono text-synapse-lime font-bold">
                  <TrendingUp className="w-4 h-4" />
                  <span>Projected Capability Shift</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-synapse-card text-synapse-subtle uppercase">
                  Simulation Active
                </span>
              </div>

              {/* Delta Score Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-synapse-subsurface border border-synapse-border space-y-2">
                  <div className="text-[10px] font-mono text-synapse-subtle uppercase">Target Role Alignment</div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-display font-bold text-synapse-cyan">
                      {Math.round(simulationResult.projected_role_alignment)}%
                    </span>
                    <span className="text-xs font-mono font-bold text-synapse-lime">
                      (+{simulationResult.delta_role_alignment} pts)
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-synapse-subtle">
                    Baseline: {Math.round(simulationResult.current_role_alignment)}%
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-synapse-subsurface border border-synapse-border space-y-2">
                  <div className="text-[10px] font-mono text-synapse-subtle uppercase">Interview Readiness</div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-display font-bold text-synapse-lime">
                      {Math.round(simulationResult.projected_readiness)}%
                    </span>
                    <span className="text-xs font-mono font-bold text-synapse-lime">
                      (+{simulationResult.delta_readiness} pts)
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-synapse-subtle">
                    Baseline: {Math.round(simulationResult.current_readiness)}%
                  </div>
                </div>
              </div>

              {/* Rationale Explanation */}
              <div className="p-4 rounded-xl bg-synapse-subsurface border border-synapse-border space-y-2">
                <div className="text-xs font-bold text-synapse-text">Analytical Rationale</div>
                <p className="text-xs text-synapse-muted leading-relaxed font-mono">
                  {simulationResult.rationale}
                </p>
              </div>

              {/* Unlocked Competencies */}
              {simulationResult.unlocked_competencies.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-mono uppercase text-synapse-subtle font-semibold">
                    Competencies Projected to Pass Interview Threshold (&gt;= 70%)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {simulationResult.unlocked_competencies.map((comp) => (
                      <span
                        key={comp}
                        className="px-3 py-1 rounded-lg bg-synapse-lime/10 border border-synapse-lime/30 text-synapse-lime text-xs font-mono font-bold capitalize"
                      >
                        ✓ {comp.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-synapse-surface border border-synapse-border flex flex-col items-center justify-center text-center space-y-4 text-synapse-subtle min-h-[400px]">
              <Zap className="w-12 h-12 text-synapse-border stroke-[1.5]" />
              <div className="text-sm font-semibold text-synapse-text">Simulation Pending</div>
              <p className="text-xs max-w-sm leading-relaxed text-synapse-muted">
                Adjust prospective skill scores on the left and click "Run Hypothetical Simulation" to project alignment trajectories.
              </p>
            </div>
          )}

          {/* Persistent Data Safety Notice */}
          <div className="p-4 rounded-xl bg-synapse-subsurface/60 border border-synapse-border flex items-start space-x-3 text-xs text-synapse-subtle">
            <ShieldAlert className="w-4 h-4 text-synapse-cyan shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Zero Persistent Mutation Guarantee:</strong> This simulator executes in isolated scratch memory. Actual Digital Twin snapshots and verified skill scores will not be altered.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
