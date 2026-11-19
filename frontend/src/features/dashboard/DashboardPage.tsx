import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import {
  Compass,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Flame,
  Clock,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { data: overview, isLoading, error } = useQuery({
    queryKey: ['dashboard_overview'],
    queryFn: () => api.getDashboardOverview(),
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-3 text-synapse-lime font-mono text-sm">
          <div className="w-3 h-3 rounded-full bg-synapse-lime animate-ping" />
          <span>Calibrating Personal Intelligence Model...</span>
        </div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="p-8 text-center text-synapse-crimson font-mono">
        Failed to load digital twin telemetry. Ensure backend is running.
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Subject Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-synapse-border">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-synapse-subtle uppercase mb-1">
            <span>Subject Intelligence Protocol</span>
            <span>•</span>
            <span className="text-synapse-lime">Active Twin Sync</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-synapse-text tracking-tight">
            Intelligence Overview: {overview.full_name}
          </h1>
          <p className="text-xs text-synapse-muted mt-1 max-w-2xl">
            Continuously synthesizing code execution, conceptual verbal evaluations, and learning agility into an evolving capability model.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/twin"
            className="px-4 py-2 rounded-lg bg-synapse-subsurface border border-synapse-border text-xs font-mono text-synapse-text hover:border-synapse-lime/60 transition-colors flex items-center space-x-2"
          >
            <span>Living Twin Topology</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/coding"
            className="px-4 py-2 rounded-lg bg-synapse-lime text-black text-xs font-semibold hover:bg-synapse-lime/90 transition-colors flex items-center space-x-1.5 shadow-lg shadow-synapse-lime/20"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Generate Evidence</span>
          </Link>
        </div>
      </div>

      {/* 5 Core Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Q1: Where am I currently? */}
        <div className="p-5 rounded-xl bg-synapse-surface border border-synapse-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-synapse-subtle mb-2">
              <span>01. Current Capability</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-synapse-lime/10 text-synapse-lime border border-synapse-lime/20">
                VERIFIED
              </span>
            </div>
            <div className="text-3xl font-display font-bold text-synapse-text">
              {Math.round(overview.overall_readiness)}%
            </div>
            <p className="text-[11px] text-synapse-muted mt-1 leading-snug">
              Bayesian composite across verified practical evidence.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-synapse-border/60 flex items-center justify-between text-xs font-mono text-synapse-subtle">
            <span>Interview Ready:</span>
            <span className="text-synapse-lime font-medium">{Math.round(overview.interview_readiness_score)}%</span>
          </div>
        </div>

        {/* Q2: Where am I heading? */}
        <div className="p-5 rounded-xl bg-synapse-surface border border-synapse-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-synapse-subtle mb-2">
              <span>02. Target Alignment</span>
              <Compass className="w-3.5 h-3.5 text-synapse-cyan" />
            </div>
            <div className="text-3xl font-display font-bold text-synapse-cyan">
              {Math.round(overview.career_alignment_score)}%
            </div>
            <div className="text-xs font-medium text-synapse-text mt-1 truncate">
              {overview.primary_target_role}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-synapse-border/60 flex items-center justify-between text-[11px] text-synapse-subtle">
            <span>Role Match:</span>
            <Link to="/careers" className="text-synapse-cyan hover:underline font-mono">Inspect &rarr;</Link>
          </div>
        </div>

        {/* Q3: Learning Momentum */}
        <div className="p-5 rounded-xl bg-synapse-surface border border-synapse-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-synapse-subtle mb-2">
              <span>03. Learning Velocity</span>
              <Flame className="w-3.5 h-3.5 text-synapse-lime" />
            </div>
            <div className="text-3xl font-display font-bold text-synapse-lime flex items-center space-x-1">
              <span>+{Math.round(overview.learning_momentum / 10)}</span>
              <span className="text-sm font-mono font-normal text-synapse-muted">pts/wk</span>
            </div>
            <p className="text-[11px] text-synapse-muted mt-1">
              Rate of improvement across successive problem attempts.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-synapse-border/60 flex items-center justify-between text-[11px] text-synapse-subtle">
            <span>Status:</span>
            <span className="text-synapse-lime font-mono">Accelerating</span>
          </div>
        </div>

        {/* Q4: Bottlenecks Flagged */}
        <div className="p-5 rounded-xl bg-synapse-surface border border-synapse-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-synapse-subtle mb-2">
              <span>04. Growth Inhibitors</span>
              <AlertTriangle className="w-3.5 h-3.5 text-synapse-crimson" />
            </div>
            <div className="text-3xl font-display font-bold text-synapse-crimson">
              {overview.identified_bottlenecks.length}
            </div>
            <p className="text-[11px] text-synapse-muted mt-1">
              {overview.identified_bottlenecks[0]?.skill_name || 'No blockers'} constraining dependent skills.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-synapse-border/60 flex items-center justify-between text-[11px] text-synapse-subtle">
            <span>Impact:</span>
            <span className="text-synapse-crimson font-mono">High Severity</span>
          </div>
        </div>
      </div>

      {/* Primary Action Card: Question 5 - What should I do next? */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-synapse-surface via-synapse-subsurface to-synapse-surface border border-synapse-lime/40 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-synapse-lime/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center space-x-2 text-xs font-mono text-synapse-lime font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Prioritized Next Best Action • Estimated {overview.next_best_action.estimated_duration}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-display font-bold text-synapse-text">
              {overview.next_best_action.title}
            </h2>
            <p className="text-xs md:text-sm text-synapse-muted leading-relaxed">
              {overview.next_best_action.rationale}
            </p>
          </div>

          <div className="shrink-0 flex items-center space-x-4">
            <Link
              to="/coding"
              className="px-6 py-3 rounded-xl bg-synapse-lime text-black font-semibold text-xs hover:bg-synapse-lime/90 transition-all flex items-center space-x-2 shadow-lg shadow-synapse-lime/20"
            >
              <span>{overview.next_best_action.action}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Top Strengths & Bottlenecks/Blind Spots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Strengths */}
        <div className="p-6 rounded-xl bg-synapse-surface border border-synapse-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-synapse-lime" />
              <h3 className="font-display font-bold text-sm text-synapse-text">Demonstrated Capabilities</h3>
            </div>
            <Link to="/skills" className="text-xs font-mono text-synapse-lime hover:underline">
              View All Skills &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {overview.top_strengths.map((skill) => (
              <div key={skill.id} className="p-3.5 rounded-lg bg-synapse-subsurface border border-synapse-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-synapse-text flex items-center space-x-2">
                    <span>{skill.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-synapse-card text-synapse-subtle">
                      {skill.category}
                    </span>
                  </div>
                  <div className="text-[11px] text-synapse-subtle font-mono mt-0.5">
                    Confidence: {skill.confidence_score}% • {skill.evidence_count} evidence logs
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-mono font-bold text-synapse-lime">
                    {Math.round(skill.proficiency_score)}%
                  </div>
                  <div className="text-[10px] font-mono text-synapse-muted uppercase">
                    {skill.trend_direction}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottlenecks & Blind Spot Detector */}
        <div className="space-y-6">
          {/* Concept Bottlenecks */}
          <div className="p-6 rounded-xl bg-synapse-surface border border-synapse-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-synapse-crimson" />
                <h3 className="font-display font-bold text-sm text-synapse-text">Concept Bottlenecks</h3>
              </div>
              <span className="text-[10px] font-mono text-synapse-crimson px-2 py-0.5 rounded bg-synapse-crimson/10 border border-synapse-crimson/20">
                PREREQUISITE BLOCKS
              </span>
            </div>

            {overview.identified_bottlenecks.map((b) => (
              <div key={b.skill_slug} className="p-3.5 rounded-lg bg-synapse-crimson/5 border border-synapse-crimson/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-synapse-text">{b.skill_name}</span>
                  <span className="text-xs font-mono font-bold text-synapse-crimson">{b.current_score}% Score</span>
                </div>
                <p className="text-[11px] text-synapse-muted leading-relaxed">
                  {b.rationale}
                </p>
                <div className="text-[10px] font-mono text-synapse-subtle">
                  Impedes: {b.affected_dependents.join(', ')}
                </div>
              </div>
            ))}
          </div>

          {/* Blind Spot Detector */}
          <div className="p-6 rounded-xl bg-synapse-surface border border-synapse-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-synapse-amber" />
                <h3 className="font-display font-bold text-sm text-synapse-text">Blind Spot Detector</h3>
              </div>
              <span className="text-[10px] font-mono text-synapse-amber px-2 py-0.5 rounded bg-synapse-amber/10 border border-synapse-amber/20">
                SELF-REPORT DISCREPANCY
              </span>
            </div>

            {overview.blind_spots.map((spot) => (
              <div key={spot.skill_slug} className="p-3.5 rounded-lg bg-synapse-subsurface border border-synapse-border space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-synapse-text">{spot.skill_name}</span>
                  <div className="flex items-center space-x-2 font-mono text-[11px]">
                    <span className="text-synapse-subtle">Declared: {spot.self_reported_score}%</span>
                    <span>&bull;</span>
                    <span className="text-synapse-amber font-bold">Assessed: {spot.assessed_score}%</span>
                  </div>
                </div>
                <p className="text-[11px] text-synapse-muted leading-relaxed">
                  {spot.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
