import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity, Shield, Terminal, LogOut, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-synapse-border bg-synapse-surface/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center space-x-4">
        <Link to="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-lg bg-synapse-subsurface border border-synapse-border flex items-center justify-center text-synapse-lime group-hover:border-synapse-lime/60 transition-colors">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-bold text-lg tracking-wider text-synapse-text">SYNAPSE</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-synapse-lime/10 text-synapse-lime border border-synapse-lime/30 font-semibold tracking-wider">
                v1.0-LIVE
              </span>
            </div>
            <p className="text-[10px] text-synapse-subtle font-mono tracking-tight hidden sm:block">
              STUDENT DIGITAL TWIN &amp; INTELLIGENCE LAB
            </p>
          </div>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-synapse-bg border border-synapse-border text-xs font-mono">
          <div className="w-2 h-2 rounded-full bg-synapse-lime animate-ping" />
          <span className="text-synapse-muted">Engine Sync:</span>
          <span className="text-synapse-lime font-medium">Deterministic Prior</span>
        </div>

        {user && (
          <div className="flex items-center space-x-3 border-l border-synapse-border pl-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-medium text-synapse-text flex items-center justify-end space-x-1">
                <span>{user.full_name || user.email}</span>
              </div>
              <div className="text-[10px] text-synapse-subtle font-mono">{user.email}</div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-lg bg-synapse-subsurface border border-synapse-border text-synapse-muted hover:text-synapse-crimson hover:border-synapse-crimson/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
