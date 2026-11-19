import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BrainCircuit,
  Cpu,
  TerminalSquare,
  Mic,
  Compass,
  GitFork,
  Zap,
  BarChart3,
  ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard, badge: null },
  { path: '/twin', label: 'Digital Twin', icon: BrainCircuit, badge: 'LIVING' },
  { path: '/skills', label: 'Skills Matrix', icon: Cpu, badge: null },
  { path: '/coding', label: 'Coding Lab', icon: TerminalSquare, badge: 'SANDBOX' },
  { path: '/interviews', label: 'Interview Studio', icon: Mic, badge: null },
  { path: '/careers', label: 'Career Explorer', icon: Compass, badge: null },
  { path: '/roadmap', label: 'Adaptive Roadmap', icon: GitFork, badge: null },
  { path: '/simulator', label: 'Future Simulator', icon: Zap, badge: 'WHAT-IF' },
  { path: '/analytics', label: 'Analytics & Trends', icon: BarChart3, badge: null },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r border-synapse-border bg-synapse-surface/50 backdrop-blur-sm flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 flex-1 space-y-1">
        <div className="px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-synapse-subtle font-semibold">
          Intelligence Rail
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-synapse-lime/10 text-synapse-lime border border-synapse-lime/30 font-semibold'
                    : 'text-synapse-muted hover:text-synapse-text hover:bg-synapse-subsurface border border-transparent'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
              </div>
              {item.badge ? (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-synapse-border text-synapse-cyan font-bold tracking-tight">
                  {item.badge}
                </span>
              ) : (
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-synapse-subtle" />
              )}
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-synapse-border m-3 rounded-xl bg-synapse-subsurface/60 border border-synapse-border">
        <div className="flex items-center space-x-2 text-xs font-medium text-synapse-text mb-1">
          <div className="w-2 h-2 rounded-full bg-synapse-lime" />
          <span>Twin Model v1.0.0</span>
        </div>
        <p className="text-[11px] text-synapse-subtle leading-relaxed">
          Bayesian proficiency and evidence-grounded confidence calculations active.
        </p>
      </div>
    </aside>
  );
};
