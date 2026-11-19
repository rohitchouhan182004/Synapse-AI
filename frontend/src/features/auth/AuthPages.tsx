import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  User,
  GraduationCap
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      login(res.access_token, {
        id: res.user_id,
        email: res.email,
        full_name: res.full_name,
        has_profile: res.has_profile,
      });
      navigate(res.has_profile ? '/dashboard' : '/onboarding');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setEmail('demo@synapse.ai');
    setPassword('SynapseDemo2026!');
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.login('demo@synapse.ai', 'SynapseDemo2026!');
      login(res.access_token, {
        id: res.user_id,
        email: res.email,
        full_name: res.full_name,
        has_profile: true,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-synapse-bg circuit-grid flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-synapse-surface border border-synapse-border space-y-6 shadow-2xl relative">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-synapse-subsurface border border-synapse-border mx-auto flex items-center justify-center text-synapse-lime">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-display font-bold text-synapse-text tracking-tight">SYNAPSE</h1>
          <p className="text-xs text-synapse-muted font-mono">Student Digital Twin &amp; Intelligence Lab</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-synapse-crimson/10 border border-synapse-crimson/30 text-xs font-mono text-synapse-crimson text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-mono text-synapse-subtle uppercase">Institutional Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-synapse-subtle absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-synapse-subsurface border border-synapse-border text-xs text-synapse-text focus:outline-none focus:border-synapse-lime"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-mono text-synapse-subtle uppercase">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-synapse-subtle absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-synapse-subsurface border border-synapse-border text-xs text-synapse-text focus:outline-none focus:border-synapse-lime"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-synapse-lime text-black font-semibold text-xs flex items-center justify-center space-x-2 hover:bg-synapse-lime/90 transition-colors shadow-lg shadow-synapse-lime/20"
          >
            <span>{isLoading ? 'Verifying Identity...' : 'Sign In to Laboratory'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-2 border-t border-synapse-border">
          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-synapse-subsurface border border-synapse-border text-xs font-mono text-synapse-text hover:border-synapse-lime transition-all flex items-center justify-center space-x-2"
          >
            <Zap className="w-3.5 h-3.5 text-synapse-lime" />
            <span>Load Demo Student Twin (Aravind Sharma)</span>
          </button>
        </div>

        <div className="text-center text-xs text-synapse-subtle font-mono">
          New subject?{' '}
          <button onClick={() => navigate('/register')} className="text-synapse-lime hover:underline">
            Initialize Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.register(email, password, fullName);
      login(res.access_token, {
        id: res.user_id,
        email: res.email,
        full_name: res.full_name,
        has_profile: false,
      });
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-synapse-bg circuit-grid flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-synapse-surface border border-synapse-border space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-display font-bold text-synapse-text tracking-tight">Initialize Subject Profile</h1>
          <p className="text-xs text-synapse-muted font-mono">Begin Personal Intelligence Modeling</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-synapse-crimson/10 border border-synapse-crimson/30 text-xs font-mono text-synapse-crimson text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-mono text-synapse-subtle uppercase">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-synapse-subtle absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Aravind Sharma"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-synapse-subsurface border border-synapse-border text-xs text-synapse-text focus:outline-none focus:border-synapse-lime"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-mono text-synapse-subtle uppercase">Institutional Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-synapse-subtle absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-synapse-subsurface border border-synapse-border text-xs text-synapse-text focus:outline-none focus:border-synapse-lime"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-mono text-synapse-subtle uppercase">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-synapse-subtle absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-synapse-subsurface border border-synapse-border text-xs text-synapse-text focus:outline-none focus:border-synapse-lime"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-synapse-lime text-black font-semibold text-xs flex items-center justify-center space-x-2 hover:bg-synapse-lime/90 transition-colors"
          >
            <span>{isLoading ? 'Creating Identity...' : 'Initialize & Proceed to Onboarding'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center text-xs text-synapse-subtle font-mono">
          Already registered?{' '}
          <button onClick={() => navigate('/login')} className="text-synapse-lime hover:underline">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export const OnboardingPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [university, setUniversity] = useState('National Institute of Technology');
  const [degree, setDegree] = useState('B.Tech in Computer Science');
  const [targetRole, setTargetRole] = useState('Backend Developer');
  const [selfReportedSQL, setSelfReportedSQL] = useState(80);
  const [selfReportedJava, setSelfReportedJava] = useState(75);
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await api.completeOnboarding({
        full_name: user?.full_name || 'Student',
        university,
        degree,
        target_role: targetRole,
        experience_level: 'intermediate',
        career_interests: ['Distributed Systems', 'Cloud Databases'],
        declared_skills: [
          { skill_slug: 'sql', self_reported_score: selfReportedSQL },
          { skill_slug: 'java', self_reported_score: selfReportedJava },
        ],
      });
      updateUser({ has_profile: true });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-synapse-bg circuit-grid flex items-center justify-center p-4">
      <div className="w-full max-w-xl p-8 rounded-2xl bg-synapse-surface border border-synapse-border space-y-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-synapse-border">
          <div>
            <span className="text-[10px] font-mono uppercase text-synapse-lime font-bold">Calibration Step 0{step} of 02</span>
            <h2 className="text-xl font-display font-bold text-synapse-text mt-1">Initialize Digital Twin Baseline</h2>
          </div>
          <div className="w-8 h-8 rounded-full bg-synapse-subsurface border border-synapse-border flex items-center justify-center text-xs font-mono font-bold text-synapse-lime">
            {step}/2
          </div>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-mono text-synapse-subtle uppercase">University / Institution</label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full p-3 rounded-xl bg-synapse-subsurface border border-synapse-border text-xs text-synapse-text focus:outline-none focus:border-synapse-lime"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-mono text-synapse-subtle uppercase">Academic Program / Degree</label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full p-3 rounded-xl bg-synapse-subsurface border border-synapse-border text-xs text-synapse-text focus:outline-none focus:border-synapse-lime"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-mono text-synapse-subtle uppercase">Primary Target Engineering Path</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full p-3 rounded-xl bg-synapse-subsurface border border-synapse-border text-xs text-synapse-text focus:outline-none focus:border-synapse-lime"
              >
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="AI Engineer">AI Engineer</option>
                <option value="Software Engineer">Software Engineer</option>
              </select>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl bg-synapse-lime text-black font-semibold text-xs flex items-center justify-center space-x-2"
            >
              <span>Continue to Prior Declaration</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-xs text-synapse-muted leading-relaxed">
              Declare your self-reported baseline comfort. The intelligence engine treats declared scores as initial low-confidence priors until verified through practical coding and verbal probes.
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span>SQL &amp; Relational Knowledge:</span>
                <span className="text-synapse-lime font-bold">{selfReportedSQL}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={selfReportedSQL}
                onChange={(e) => setSelfReportedSQL(Number(e.target.value))}
                className="w-full accent-synapse-lime bg-synapse-subsurface h-2 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span>Core Java &amp; OOP Foundations:</span>
                <span className="text-synapse-lime font-bold">{selfReportedJava}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={selfReportedJava}
                onChange={(e) => setSelfReportedJava(Number(e.target.value))}
                className="w-full accent-synapse-lime bg-synapse-subsurface h-2 rounded-lg"
              />
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-xl bg-synapse-subsurface border border-synapse-border text-xs font-mono text-synapse-subtle"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={isLoading}
                className="flex-1 py-3 rounded-xl bg-synapse-lime text-black font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-synapse-lime/20"
              >
                <span>{isLoading ? 'Calibrating Initial Twin...' : 'Launch Digital Twin Laboratory'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
