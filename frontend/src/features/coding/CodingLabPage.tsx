import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { CodingQuestion, CodingSubmission } from '../../types';
import {
  TerminalSquare,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  HardDrive,
  AlertTriangle,
  Code2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const CodingLabPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedQuestion, setSelectedQuestion] = useState<CodingQuestion | null>(null);
  const [language, setLanguage] = useState<string>('python');
  const [code, setCode] = useState<string>('');
  const [submissionResult, setSubmissionResult] = useState<CodingSubmission | null>(null);

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['coding_questions'],
    queryFn: async () => {
      const qs = await api.getCodingQuestions();
      if (qs.length > 0 && !selectedQuestion) {
        setSelectedQuestion(qs[0]);
        setCode(qs[0].starter_code['python'] || '# Write code here');
      }
      return qs;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!selectedQuestion) return;
      return api.submitCode(selectedQuestion.id, language, code);
    },
    onSuccess: (data) => {
      if (data) {
        setSubmissionResult(data);
        // Invalidate twin and dashboard queries to immediately reflect newly created evidence!
        queryClient.invalidateQueries({ queryKey: ['dashboard_overview'] });
        queryClient.invalidateQueries({ queryKey: ['current_twin'] });
        queryClient.invalidateQueries({ queryKey: ['my_skills'] });
      }
    },
  });

  const handleSelectQuestion = (q: CodingQuestion) => {
    setSelectedQuestion(q);
    setCode(q.starter_code[language] || q.starter_code['python'] || '# Write code here');
    setSubmissionResult(null);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    if (selectedQuestion) {
      setCode(selectedQuestion.starter_code[lang] || code);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-synapse-border">
        <div className="flex items-center space-x-2 text-xs font-mono text-synapse-lime uppercase mb-1">
          <TerminalSquare className="w-4 h-4" />
          <span>Evidence Generation Lab</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-synapse-text tracking-tight">
          Algorithmic Coding Sandbox
        </h1>
        <p className="text-xs text-synapse-muted mt-1 max-w-2xl">
          Code submissions generate deterministic execution signals and directly update your Digital Twin capability model and snapshot history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Question Library */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-mono uppercase text-synapse-subtle font-semibold">
            Assessment Library ({questions.length})
          </h2>
          <div className="space-y-2">
            {questions.map((q) => (
              <div
                key={q.id}
                onClick={() => handleSelectQuestion(q)}
                className={`p-4 rounded-xl bg-synapse-surface border cursor-pointer transition-all ${
                  selectedQuestion?.id === q.id
                    ? 'border-synapse-lime ring-1 ring-synapse-lime bg-synapse-subsurface'
                    : 'border-synapse-border hover:border-synapse-borderBright'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-synapse-card text-synapse-cyan font-bold uppercase">
                    {q.topic}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold capitalize ${
                      q.difficulty === 'easy'
                        ? 'text-synapse-lime'
                        : q.difficulty === 'medium'
                        ? 'text-synapse-amber'
                        : 'text-synapse-crimson'
                    }`}
                  >
                    {q.difficulty}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-synapse-text">{q.title}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Center & Right: Problem Description & Code Editor */}
        <div className="lg:col-span-8 space-y-4">
          {selectedQuestion && (
            <>
              {/* Problem Brief */}
              <div className="p-5 rounded-xl bg-synapse-surface border border-synapse-border space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-display font-bold text-synapse-text">{selectedQuestion.title}</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-synapse-subtle">Language:</span>
                    <select
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="bg-synapse-subsurface border border-synapse-border rounded-lg text-xs font-mono px-2.5 py-1 text-synapse-text focus:outline-none focus:border-synapse-lime"
                    >
                      <option value="python">Python 3.12</option>
                      <option value="java">Java 21</option>
                    </select>
                  </div>
                </div>

                <p className="text-xs text-synapse-muted leading-relaxed whitespace-pre-line">
                  {selectedQuestion.description}
                </p>

                {selectedQuestion.constraints && (
                  <div className="p-3 rounded-lg bg-synapse-subsurface border border-synapse-border text-[11px] font-mono text-synapse-subtle">
                    <span className="text-synapse-muted font-bold">Constraints: </span>
                    {selectedQuestion.constraints}
                  </div>
                )}
              </div>

              {/* Code Editor Surface */}
              <div className="rounded-xl border border-synapse-border bg-synapse-bg overflow-hidden">
                <div className="px-4 py-2 border-b border-synapse-border bg-synapse-surface flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-mono text-synapse-subtle">
                    <Code2 className="w-4 h-4 text-synapse-lime" />
                    <span>solution.{language === 'python' ? 'py' : 'java'}</span>
                  </div>
                  <button
                    disabled={submitMutation.isPending}
                    onClick={() => submitMutation.mutate()}
                    className="px-4 py-1.5 rounded-lg bg-synapse-lime text-black font-semibold text-xs flex items-center space-x-1.5 hover:bg-synapse-lime/90 transition-colors shadow-md shadow-synapse-lime/20"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <div className="w-3 h-3 rounded-full border-2 border-black border-t-transparent animate-spin" />
                        <span>Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Run &amp; Submit Evidence</span>
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={14}
                  className="w-full bg-synapse-bg p-4 font-mono text-xs text-synapse-text leading-relaxed focus:outline-none resize-none selection:bg-synapse-lime selection:text-black"
                  placeholder="Implement algorithm..."
                />
              </div>

              {/* Execution Telemetry Result */}
              {submissionResult && (
                <div
                  className={`p-5 rounded-xl border space-y-3 ${
                    submissionResult.status === 'accepted'
                      ? 'bg-synapse-lime/10 border-synapse-lime/40'
                      : 'bg-synapse-crimson/10 border-synapse-crimson/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {submissionResult.status === 'accepted' ? (
                        <CheckCircle2 className="w-5 h-5 text-synapse-lime" />
                      ) : (
                        <XCircle className="w-5 h-5 text-synapse-crimson" />
                      )}
                      <span className="font-display font-bold text-sm uppercase text-synapse-text">
                        {submissionResult.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-xs font-mono">
                      <div className="flex items-center space-x-1 text-synapse-muted">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{submissionResult.runtime_ms} ms</span>
                      </div>
                      <div className="flex items-center space-x-1 text-synapse-muted">
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>{Math.round(submissionResult.memory_kb / 1024)} MB</span>
                      </div>
                      <div className="font-bold text-synapse-text">
                        {submissionResult.test_cases_passed}/{submissionResult.total_test_cases} Passed
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-synapse-muted font-mono">{submissionResult.feedback}</p>

                  <div className="pt-2 border-t border-synapse-border/40 flex items-center justify-between text-xs font-mono text-synapse-lime">
                    <span className="flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Digital Twin Neural Model Recalibrated via Evidence Log</span>
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
