import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import {
  GitFork,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ArrowRight,
  Layers,
  Flame,
  AlertCircle
} from 'lucide-react';

export const RoadmapPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedPhase, setSelectedPhase] = useState<number>(0); // 0 = all

  const { data: roadmap, isLoading } = useQuery({
    queryKey: ['my_roadmap'],
    queryFn: () => api.getRoadmap(),
  });

  const toggleTaskMutation = useMutation({
    mutationFn: (taskId: number) => api.toggleRoadmapTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my_roadmap'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_overview'] });
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: (targetRole?: string) => api.generateRoadmap(targetRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my_roadmap'] });
    },
  });

  if (isLoading || !roadmap) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-3 text-synapse-lime font-mono text-sm">
          <GitFork className="w-5 h-5 animate-pulse text-synapse-lime" />
          <span>Generating Adaptive Mastery Path...</span>
        </div>
      </div>
    );
  }

  const tasksByPhase: Record<number, typeof roadmap.tasks> = {};
  roadmap.tasks.forEach((t) => {
    if (!tasksByPhase[t.phase_number]) tasksByPhase[t.phase_number] = [];
    tasksByPhase[t.phase_number].push(t);
  });

  const filteredTasks = selectedPhase === 0 ? roadmap.tasks : tasksByPhase[selectedPhase] || [];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-synapse-border">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-synapse-lime uppercase mb-1">
            <GitFork className="w-4 h-4" />
            <span>Target Role Development Path</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-synapse-text tracking-tight">
            {roadmap.title}
          </h1>
          <p className="text-xs text-synapse-muted mt-1 max-w-2xl">
            Continuously restructured by the intelligence engine based on verified competency gaps and prerequisite graph traversal.
          </p>
        </div>

        <button
          onClick={() => regenerateMutation.mutate(roadmap.target_role_name)}
          disabled={regenerateMutation.isPending}
          className="px-4 py-2 rounded-xl bg-synapse-surface border border-synapse-border text-xs font-mono text-synapse-text hover:border-synapse-lime transition-all flex items-center space-x-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-synapse-lime" />
          <span>{regenerateMutation.isPending ? 'Recalculating...' : 'Recalculate Roadmap'}</span>
        </button>
      </div>

      {/* Progress Metric Card */}
      <div className="p-6 rounded-2xl bg-synapse-surface border border-synapse-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-mono text-synapse-subtle uppercase">Target Mastery Progress</div>
          <div className="text-2xl font-display font-bold text-synapse-text flex items-center space-x-3">
            <span>{Math.round(roadmap.progress_percentage)}% Completed</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-synapse-lime/10 text-synapse-lime border border-synapse-lime/30">
              Active Phase: 0{roadmap.current_phase}
            </span>
          </div>
        </div>

        <div className="w-full sm:w-64 space-y-1.5">
          <div className="w-full h-2 rounded-full bg-synapse-subsurface overflow-hidden">
            <div
              className="h-full bg-synapse-lime rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, roadmap.progress_percentage))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-synapse-subtle">
            <span>{roadmap.tasks.filter((t) => t.status === 'completed').length} Tasks Done</span>
            <span>{roadmap.tasks.length} Total Milestones</span>
          </div>
        </div>
      </div>

      {/* Phase Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedPhase(0)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors shrink-0 ${
            selectedPhase === 0
              ? 'bg-synapse-lime text-black font-semibold'
              : 'bg-synapse-surface border border-synapse-border text-synapse-muted hover:text-synapse-text'
          }`}
        >
          All Phases ({roadmap.tasks.length})
        </button>
        {[1, 2, 3, 4].map((pNum) => (
          <button
            key={pNum}
            onClick={() => setSelectedPhase(pNum)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors shrink-0 ${
              selectedPhase === pNum
                ? 'bg-synapse-lime text-black font-semibold'
                : 'bg-synapse-surface border border-synapse-border text-synapse-muted hover:text-synapse-text'
            }`}
          >
            Phase 0{pNum} ({tasksByPhase[pNum]?.length || 0})
          </button>
        ))}
      </div>

      {/* Milestone Task List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const isDone = task.status === 'completed';

          return (
            <div
              key={task.id}
              className={`p-5 rounded-xl border transition-all ${
                isDone
                  ? 'bg-synapse-surface/60 border-synapse-border/60 opacity-80'
                  : 'bg-synapse-surface border-synapse-border hover:border-synapse-lime/60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-3.5">
                  <button
                    onClick={() => toggleTaskMutation.mutate(task.id)}
                    className="mt-0.5 text-synapse-subtle hover:text-synapse-lime transition-colors shrink-0"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-synapse-lime fill-synapse-lime/20" />
                    ) : (
                      <Circle className="w-5 h-5 text-synapse-subtle" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-synapse-subsurface text-synapse-subtle">
                        {task.phase_title}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                          task.priority === 'critical'
                            ? 'bg-synapse-crimson/10 text-synapse-crimson border border-synapse-crimson/20'
                            : 'bg-synapse-card text-synapse-muted'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <h3
                      className={`text-sm font-semibold ${
                        isDone ? 'line-through text-synapse-muted' : 'text-synapse-text'
                      }`}
                    >
                      {task.title}
                    </h3>

                    <p className="text-xs text-synapse-muted leading-relaxed max-w-3xl">
                      {task.description}
                    </p>

                    {task.rationale && (
                      <div className="text-[11px] font-mono text-synapse-subtle pt-1">
                        <span className="text-synapse-lime font-semibold">Rationale: </span>
                        {task.rationale}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center space-x-1 text-xs font-mono text-synapse-subtle justify-end">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{task.estimated_hours} hrs</span>
                  </div>
                  {task.prerequisites.length > 0 && (
                    <div className="text-[10px] font-mono text-synapse-amber mt-1">
                      Req: {task.prerequisites.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
