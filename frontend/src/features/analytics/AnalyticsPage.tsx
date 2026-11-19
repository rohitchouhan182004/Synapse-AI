import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Calendar,
  Flame,
  CheckCircle2
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics_overview'],
    queryFn: () => api.getAnalytics(),
  });

  if (isLoading || !analytics) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-3 text-synapse-lime font-mono text-sm">
          <Activity className="w-5 h-5 animate-pulse text-synapse-lime" />
          <span>Aggregating Longitudinal Telemetry...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-synapse-border">
        <div className="flex items-center space-x-2 text-xs font-mono text-synapse-lime uppercase mb-1">
          <BarChart3 className="w-4 h-4" />
          <span>Longitudinal Performance Telemetry</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-synapse-text tracking-tight">
          Analytics &amp; Learning Agility
        </h1>
        <p className="text-xs text-synapse-muted mt-1 max-w-2xl">
          Real telemetry measuring improvement velocity, retention stability, coding test case accuracy, and verbal interview evolution.
        </p>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-synapse-surface border border-synapse-border">
          <div className="text-[10px] font-mono text-synapse-subtle uppercase">Total Submissions</div>
          <div className="text-2xl font-mono font-bold text-synapse-text mt-1">
            {analytics.metrics_summary.total_coding_submissions}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-synapse-surface border border-synapse-border">
          <div className="text-[10px] font-mono text-synapse-subtle uppercase">Mock Probes</div>
          <div className="text-2xl font-mono font-bold text-synapse-cyan mt-1">
            {analytics.metrics_summary.total_interviews}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-synapse-surface border border-synapse-border">
          <div className="text-[10px] font-mono text-synapse-subtle uppercase">Mapped Skills</div>
          <div className="text-2xl font-mono font-bold text-synapse-lime mt-1">
            {analytics.metrics_summary.total_skills_mapped}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-synapse-surface border border-synapse-border">
          <div className="text-[10px] font-mono text-synapse-subtle uppercase">Learning Momentum</div>
          <div className="text-base font-display font-bold text-synapse-lime mt-1.5 flex items-center space-x-1">
            <Flame className="w-4 h-4" />
            <span>{analytics.metrics_summary.current_momentum}</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Twin Snapshot Readiness Evolution */}
        <div className="p-6 rounded-2xl bg-synapse-surface border border-synapse-border space-y-4">
          <h3 className="text-xs font-mono uppercase text-synapse-subtle font-semibold flex items-center justify-between">
            <span>Overall Readiness Evolution Over Time</span>
            <span className="text-synapse-lime">Snapshot Progression</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.readiness_timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#233042" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F141C', borderColor: '#233042', borderRadius: '8px', fontSize: '11px', color: '#F3F4F6' }}
                />
                <Line type="monotone" dataKey="overall_readiness" stroke="#B4F342" strokeWidth={2.5} dot={{ fill: '#B4F342', r: 4 }} />
                <Line type="monotone" dataKey="confidence" stroke="#06B6D4" strokeWidth={1.5} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Domain Proficiency Matrix */}
        <div className="p-6 rounded-2xl bg-synapse-surface border border-synapse-border space-y-4">
          <h3 className="text-xs font-mono uppercase text-synapse-subtle font-semibold flex items-center justify-between">
            <span>Domain Proficiency Breakdown</span>
            <span className="text-synapse-cyan">Scores (0-100)</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.domain_breakdown.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#233042" />
                <XAxis dataKey="skill" stroke="#64748B" fontSize={10} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F141C', borderColor: '#233042', borderRadius: '8px', fontSize: '11px', color: '#F3F4F6' }}
                />
                <Bar dataKey="proficiency" fill="#B4F342" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
