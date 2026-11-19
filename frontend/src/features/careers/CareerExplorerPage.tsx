import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { CareerRole } from '../../types';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  GitCompare,
  ShieldCheck,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

export const CareerExplorerPage: React.FC = () => {
  const [selectedRoleSlug, setSelectedRoleSlug] = useState<string>('backend-developer');
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [compareRoleIds, setCompareRoleIds] = useState<number[]>([1, 2]);

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['career_roles'],
    queryFn: () => api.getCareerRoles(),
  });

  const activeRole = roles.find((r) => r.slug === selectedRoleSlug) || roles[0];

  const toggleCompareId = (id: number) => {
    if (compareRoleIds.includes(id)) {
      if (compareRoleIds.length > 1) {
        setCompareRoleIds(compareRoleIds.filter((x) => x !== id));
      }
    } else {
      if (compareRoleIds.length < 3) {
        setCompareRoleIds([...compareRoleIds, id]);
      }
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-synapse-border">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-synapse-cyan uppercase mb-1">
            <Compass className="w-4 h-4" />
            <span>Career Intelligence &amp; Market Alignment</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-synapse-text tracking-tight">
            Career Role Explorer
          </h1>
          <p className="text-xs text-synapse-muted mt-1 max-w-2xl">
            Examine how your verified competencies compare against industry role profiles. Alignment is separated from interview readiness to reflect true market posture.
          </p>
        </div>

        <button
          onClick={() => setCompareMode(!compareMode)}
          className={`px-4 py-2 rounded-xl text-xs font-mono flex items-center space-x-2 transition-all ${
            compareMode
              ? 'bg-synapse-cyan text-black font-semibold shadow-lg shadow-synapse-cyan/20'
              : 'bg-synapse-surface border border-synapse-border text-synapse-text hover:border-synapse-cyan'
          }`}
        >
          <GitCompare className="w-4 h-4" />
          <span>{compareMode ? 'Exit Comparison' : 'Side-by-Side Compare'}</span>
        </button>
      </div>

      {!compareMode ? (
        /* Single Role Deep Dive Mode */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Role Cards */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-mono uppercase text-synapse-subtle font-semibold">
              Tracked Roles ({roles.length})
            </h2>

            <div className="space-y-2.5">
              {roles.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedRoleSlug(r.slug)}
                  className={`p-4 rounded-xl bg-synapse-surface border cursor-pointer transition-all ${
                    activeRole?.slug === r.slug
                      ? 'border-synapse-cyan ring-1 ring-synapse-cyan bg-synapse-subsurface'
                      : 'border-synapse-border hover:border-synapse-borderBright'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-synapse-card text-synapse-subtle font-bold uppercase">
                        {r.category}
                      </span>
                      <h3 className="text-sm font-bold text-synapse-text mt-1.5">{r.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-mono font-bold text-synapse-cyan">
                        {Math.round(r.alignment_score)}%
                      </div>
                      <div className="text-[10px] font-mono text-synapse-subtle">Alignment</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-synapse-subtle border-t border-synapse-border/40 pt-2">
                    <span>Readiness: <strong className="text-synapse-text">{Math.round(r.readiness_score)}%</strong></span>
                    <span>Evidence: <strong className="text-synapse-lime">{Math.round(r.evidence_coverage)}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Role Breakdown */}
          {activeRole && (
            <div className="lg:col-span-8 space-y-6">
              <div className="p-6 rounded-2xl bg-synapse-surface border border-synapse-border space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-display font-bold text-synapse-text">{activeRole.name}</h2>
                    <p className="text-xs text-synapse-muted mt-1 leading-relaxed max-w-xl">
                      {activeRole.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-synapse-subsurface border border-synapse-border text-center min-w-[90px]">
                      <div className="text-[10px] font-mono text-synapse-subtle uppercase">Alignment</div>
                      <div className="text-2xl font-mono font-bold text-synapse-cyan mt-0.5">
                        {Math.round(activeRole.alignment_score)}%
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-synapse-subsurface border border-synapse-border text-center min-w-[90px]">
                      <div className="text-[10px] font-mono text-synapse-subtle uppercase">Readiness</div>
                      <div className="text-2xl font-mono font-bold text-synapse-lime mt-0.5">
                        {Math.round(activeRole.readiness_score)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-synapse-subsurface border border-synapse-border text-xs font-mono text-synapse-muted">
                  <span className="text-synapse-cyan font-bold">Evidence Coverage: </span>
                  {activeRole.evidence_coverage}% of core role requirements verified via assessment logs.
                </div>
              </div>

              {/* Requirements Diffing Table */}
              <div className="p-6 rounded-2xl bg-synapse-surface border border-synapse-border space-y-4">
                <h3 className="text-xs font-mono uppercase text-synapse-subtle font-semibold">
                  Competency Requirements &amp; Student Proficiency Delta
                </h3>

                <div className="space-y-3">
                  {activeRole.requirements.map((req) => {
                    const delta = Math.round(req.student_proficiency - req.expected_proficiency);
                    const meetsRequirement = req.student_proficiency >= req.expected_proficiency;

                    return (
                      <div
                        key={req.skill_slug}
                        className="p-3.5 rounded-xl bg-synapse-subsurface border border-synapse-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-synapse-text">{req.skill_name}</span>
                            {req.is_mandatory && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-synapse-crimson/10 text-synapse-crimson border border-synapse-crimson/20 font-bold uppercase">
                                Mandatory
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-synapse-subtle">
                            Importance: {req.importance_weight}x • Target: {Math.round(req.expected_proficiency)}%
                          </div>
                        </div>

                        <div className="flex items-center space-x-6 justify-between sm:justify-end">
                          <div className="w-36 space-y-1">
                            <div className="flex justify-between text-[10px] font-mono">
                              <span className="text-synapse-subtle">Assessed:</span>
                              <span className={meetsRequirement ? 'text-synapse-lime font-bold' : 'text-synapse-amber font-bold'}>
                                {Math.round(req.student_proficiency)}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-synapse-card overflow-hidden">
                              <div
                                className={`h-full rounded-full ${meetsRequirement ? 'bg-synapse-lime' : 'bg-synapse-amber'}`}
                                style={{ width: `${Math.min(100, Math.max(5, req.student_proficiency))}%` }}
                              />
                            </div>
                          </div>

                          <div className="font-mono text-xs w-16 text-right">
                            {delta >= 0 ? (
                              <span className="text-synapse-lime">+{delta} pts</span>
                            ) : (
                              <span className="text-synapse-crimson">{delta} pts</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Side by Side Multi-Role Compare View */
        <div className="space-y-6">
          <div className="flex items-center space-x-3 text-xs font-mono text-synapse-subtle">
            <span>Select roles to compare (up to 3):</span>
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => toggleCompareId(r.id)}
                className={`px-3 py-1 rounded-lg border transition-all ${
                  compareRoleIds.includes(r.id)
                    ? 'border-synapse-cyan bg-synapse-cyan/10 text-synapse-cyan font-bold'
                    : 'border-synapse-border bg-synapse-surface text-synapse-muted'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles
              .filter((r) => compareRoleIds.includes(r.id))
              .map((role) => (
                <div key={role.id} className="p-6 rounded-2xl bg-synapse-surface border border-synapse-border space-y-4">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-synapse-subsurface text-synapse-cyan uppercase font-bold">
                      {role.category}
                    </span>
                    <h3 className="text-lg font-display font-bold text-synapse-text mt-1.5">{role.name}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-synapse-subsurface border border-synapse-border">
                      <div className="text-[10px] font-mono text-synapse-subtle uppercase">Alignment</div>
                      <div className="text-2xl font-mono font-bold text-synapse-cyan mt-0.5">
                        {Math.round(role.alignment_score)}%
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-synapse-subsurface border border-synapse-border">
                      <div className="text-[10px] font-mono text-synapse-subtle uppercase">Readiness</div>
                      <div className="text-2xl font-mono font-bold text-synapse-lime mt-0.5">
                        {Math.round(role.readiness_score)}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-synapse-border text-xs">
                    <div className="font-mono text-synapse-subtle uppercase text-[10px]">Key Requirements:</div>
                    {role.requirements.slice(0, 5).map((req) => (
                      <div key={req.skill_slug} className="flex justify-between text-[11px] font-mono text-synapse-muted">
                        <span>{req.skill_name}</span>
                        <span className={req.student_proficiency >= req.expected_proficiency ? 'text-synapse-lime font-bold' : 'text-synapse-amber'}>
                          {Math.round(req.student_proficiency)}% / {Math.round(req.expected_proficiency)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
