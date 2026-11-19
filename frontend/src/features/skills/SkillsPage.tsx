import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { StudentSkill } from '../../types';
import {
  Cpu,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  Layers,
  ChevronRight
} from 'lucide-react';

export const SkillsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSkillSlug, setSelectedSkillSlug] = useState<string | null>(null);

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ['my_skills'],
    queryFn: () => api.getMySkills(),
  });

  const { data: skillDetail } = useQuery({
    queryKey: ['skill_detail', selectedSkillSlug],
    queryFn: () => (selectedSkillSlug ? api.getSkillDetail(selectedSkillSlug) : null),
    enabled: !!selectedSkillSlug,
  });

  const categories = ['all', ...Array.from(new Set(skills.map((s) => s.category)))];

  const filteredSkills = skills.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.slug.includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-synapse-border">
        <div className="flex items-center space-x-2 text-xs font-mono text-synapse-lime uppercase mb-1">
          <Cpu className="w-4 h-4" />
          <span>Competency Matrix</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-synapse-text tracking-tight">
          Assessed Skills &amp; Evidentiary Provenance
        </h1>
        <p className="text-xs text-synapse-muted mt-1 max-w-2xl">
          Complete relational registry of demonstrated technical abilities, Bayesian uncertainty intervals, and historical assessment records.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-synapse-subtle absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search competencies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-synapse-surface border border-synapse-border text-xs text-synapse-text focus:outline-none focus:border-synapse-lime"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-synapse-lime text-black font-semibold'
                  : 'bg-synapse-surface border border-synapse-border text-synapse-muted hover:text-synapse-text'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Skills + Drawer if selected */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map((s) => (
          <div
            key={s.id}
            onClick={() => setSelectedSkillSlug(s.slug)}
            className={`p-5 rounded-xl bg-synapse-surface border transition-all cursor-pointer hover:border-synapse-lime/60 ${
              selectedSkillSlug === s.slug ? 'border-synapse-lime ring-1 ring-synapse-lime' : 'border-synapse-border'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-synapse-subsurface text-synapse-cyan font-bold uppercase">
                  {s.category}
                </span>
                <h3 className="text-base font-display font-bold text-synapse-text mt-2">{s.name}</h3>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-synapse-lime">
                  {Math.round(s.proficiency_score)}%
                </div>
                <div className="text-[10px] font-mono text-synapse-subtle uppercase flex items-center justify-end space-x-1 mt-0.5">
                  {s.trend_direction === 'improving' && <TrendingUp className="w-3 h-3 text-synapse-lime" />}
                  {s.trend_direction === 'declining' && <TrendingDown className="w-3 h-3 text-synapse-crimson" />}
                  {s.trend_direction === 'stable' && <Minus className="w-3 h-3 text-synapse-subtle" />}
                  <span>{s.trend_direction}</span>
                </div>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="mt-4 space-y-2">
              <div>
                <div className="flex justify-between text-[11px] font-mono text-synapse-subtle mb-1">
                  <span>Proficiency</span>
                  <span className="text-synapse-text">{Math.round(s.proficiency_score)}/100</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-synapse-subsurface overflow-hidden">
                  <div
                    className="h-full bg-synapse-lime rounded-full"
                    style={{ width: `${Math.min(100, Math.max(5, s.proficiency_score))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-synapse-subtle mb-1">
                  <span>Confidence Certainty</span>
                  <span className="text-synapse-cyan">{Math.round(s.confidence_score)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-synapse-subsurface overflow-hidden">
                  <div
                    className="h-full bg-synapse-cyan rounded-full"
                    style={{ width: `${Math.min(100, Math.max(5, s.confidence_score))}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-synapse-border flex items-center justify-between text-[11px] font-mono text-synapse-subtle">
              <span>{s.evidence_count} evidence records</span>
              <span className="text-synapse-lime flex items-center">
                Inspect <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal / Drawer for Evidence Provenance */}
      {selectedSkillSlug && skillDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-synapse-surface border border-synapse-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-synapse-border">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-synapse-subsurface text-synapse-cyan uppercase font-bold">
                  {skillDetail.skill.category}
                </span>
                <h2 className="text-xl font-display font-bold text-synapse-text mt-1">{skillDetail.skill.name}</h2>
              </div>
              <button
                onClick={() => setSelectedSkillSlug(null)}
                className="text-synapse-subtle hover:text-synapse-text font-mono text-xs px-2 py-1 rounded bg-synapse-subsurface"
              >
                Close [ESC]
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-synapse-subsurface border border-synapse-border">
                <div className="text-[10px] font-mono text-synapse-subtle uppercase">Proficiency</div>
                <div className="text-2xl font-mono font-bold text-synapse-lime mt-1">
                  {Math.round(skillDetail.skill.proficiency_score)}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-synapse-subsurface border border-synapse-border">
                <div className="text-[10px] font-mono text-synapse-subtle uppercase">Confidence</div>
                <div className="text-2xl font-mono font-bold text-synapse-cyan mt-1">
                  {Math.round(skillDetail.skill.confidence_score)}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-synapse-subsurface border border-synapse-border">
                <div className="text-[10px] font-mono text-synapse-subtle uppercase">Evidence Records</div>
                <div className="text-2xl font-mono font-bold text-synapse-text mt-1">
                  {skillDetail.evidence_history.length}
                </div>
              </div>
            </div>

            {/* Evidence History Provenance */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase text-synapse-subtle font-semibold">
                Historical Assessment Evidence
              </h3>
              {skillDetail.evidence_history.length === 0 ? (
                <div className="p-4 rounded-xl bg-synapse-subsurface border border-synapse-border text-xs text-synapse-subtle font-mono text-center">
                  No verified assessment records logged yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {skillDetail.evidence_history.map((ev: any) => (
                    <div key={ev.id} className="p-3 rounded-lg bg-synapse-subsurface border border-synapse-border flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-synapse-text capitalize">{ev.source_type.replace('_', ' ')}</div>
                        <div className="text-[11px] text-synapse-subtle font-mono">
                          Quality: {ev.evidence_quality}x • Weight: {ev.difficulty_weight}x
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-synapse-lime text-sm">
                          {Math.round(ev.normalized_score)}%
                        </span>
                        <div className="text-[10px] text-synapse-subtle font-mono">
                          {new Date(ev.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
