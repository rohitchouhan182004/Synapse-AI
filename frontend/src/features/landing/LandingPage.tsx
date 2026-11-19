import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  BrainCircuit,
  Zap,
  ShieldCheck,
  Compass,
  ArrowRight,
  TrendingUp,
  Cpu,
  GitFork
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-synapse-bg text-synapse-text circuit-grid selection:bg-synapse-lime selection:text-black">
      {/* Top Bar */}
      <header className="h-20 border-b border-synapse-border/60 px-6 md:px-12 flex items-center justify-between sticky top-0 bg-synapse-bg/90 backdrop-blur-md z-40">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-synapse-surface border border-synapse-border flex items-center justify-center text-synapse-lime">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="font-display font-bold text-xl tracking-wider text-synapse-text">SYNAPSE</span>
            <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded bg-synapse-lime/10 text-synapse-lime border border-synapse-lime/20 font-bold">
              DIGITAL TWIN
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl text-xs font-mono text-synapse-muted hover:text-synapse-text transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl bg-synapse-lime text-black font-semibold text-xs hover:bg-synapse-lime/90 transition-all shadow-lg shadow-synapse-lime/20"
          >
            Launch Lab
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-24 px-6 md:px-12 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-synapse-surface border border-synapse-border text-xs font-mono text-synapse-lime">
          <div className="w-2 h-2 rounded-full bg-synapse-lime animate-ping" />
          <span>Next-Generation Student Digital Twin Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tight text-synapse-text leading-[1.1] max-w-4xl mx-auto">
          An evolving computational model of human engineering capability.
        </h1>

        <p className="text-sm md:text-lg text-synapse-muted max-w-2xl mx-auto leading-relaxed">
          Traditional platforms track course completions in isolation. SYNAPSE constructs a continuously calibrated Digital Twin synthesized from verified code execution, verbal conceptual depth, and prerequisite graph traversal.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-synapse-lime text-black font-semibold text-sm hover:bg-synapse-lime/90 transition-all flex items-center justify-center space-x-2 shadow-xl shadow-synapse-lime/20"
          >
            <span>Explore Aravind Sharma's Demo Twin</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-synapse-surface border border-synapse-border text-sm font-mono text-synapse-text hover:border-synapse-lime transition-all flex items-center justify-center space-x-2"
          >
            <span>Initialize New Profile</span>
          </Link>
        </div>
      </section>

      {/* 3 Pillar Feature Cards */}
      <section className="pb-28 px-6 md:px-12 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-2xl bg-synapse-surface border border-synapse-border space-y-4">
          <div className="w-10 h-10 rounded-xl bg-synapse-subsurface border border-synapse-border flex items-center justify-center text-synapse-lime">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-display font-bold text-synapse-text">Living Neural Topology</h3>
          <p className="text-xs text-synapse-muted leading-relaxed">
            Not a static radar chart. An interactive force network modeling prerequisite dependencies, concept bottlenecks, and Bayesian uncertainty.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-synapse-surface border border-synapse-border space-y-4">
          <div className="w-10 h-10 rounded-xl bg-synapse-subsurface border border-synapse-border flex items-center justify-center text-synapse-cyan">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-display font-bold text-synapse-text">Career Readiness vs Alignment</h3>
          <p className="text-xs text-synapse-muted leading-relaxed">
            Role alignment is separated from interview readiness to reflect true market posture across verified practical evidence.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-synapse-surface border border-synapse-border space-y-4">
          <div className="w-10 h-10 rounded-xl bg-synapse-subsurface border border-synapse-border flex items-center justify-center text-synapse-amber">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-display font-bold text-synapse-text">Future Self Simulator</h3>
          <p className="text-xs text-synapse-muted leading-relaxed">
            Hypothetical sandboxed experimentation: project prospective skill acquisitions without altering your persistent authoritative record.
          </p>
        </div>
      </section>
    </div>
  );
};
