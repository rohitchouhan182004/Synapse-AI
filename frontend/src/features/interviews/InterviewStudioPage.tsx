import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { InterviewSession } from '../../types';
import {
  Mic,
  Send,
  CheckCircle2,
  AlertTriangle,
  History,
  Sparkles,
  ChevronRight,
  MessageSquare
} from 'lucide-react';

export const InterviewStudioPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [topic, setTopic] = useState<string>('Backend Architecture');
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [studentAnswer, setStudentAnswer] = useState<string>('');
  const [lastFeedback, setLastFeedback] = useState<any>(null);

  const { data: history = [] } = useQuery({
    queryKey: ['interview_history'],
    queryFn: () => api.getInterviewHistory(),
  });

  const createSessionMutation = useMutation({
    mutationFn: () => api.createInterviewSession(topic),
    onSuccess: (data) => {
      setActiveSession(data);
      setActiveQuestionIdx(0);
      setStudentAnswer('');
      setLastFeedback(null);
    },
  });

  const answerMutation = useMutation({
    mutationFn: async () => {
      if (!activeSession || !activeSession.questions[activeQuestionIdx]) return;
      const q = activeSession.questions[activeQuestionIdx];
      return api.submitInterviewAnswer(q.id, studentAnswer);
    },
    onSuccess: (data) => {
      setLastFeedback(data);
      queryClient.invalidateQueries({ queryKey: ['interview_history'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_overview'] });
      queryClient.invalidateQueries({ queryKey: ['current_twin'] });
    },
  });

  const handleNextQuestion = () => {
    if (!activeSession) return;
    if (activeQuestionIdx + 1 < activeSession.questions.length) {
      setActiveQuestionIdx((prev) => prev + 1);
      setStudentAnswer('');
      setLastFeedback(null);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-synapse-border">
        <div className="flex items-center space-x-2 text-xs font-mono text-synapse-cyan uppercase mb-1">
          <Mic className="w-4 h-4" />
          <span>Verbal Probe &amp; Conceptual Depth</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-synapse-text tracking-tight">
          Interview Studio
        </h1>
        <p className="text-xs text-synapse-muted mt-1 max-w-2xl">
          Conduct structured conceptual mock probes evaluating technical accuracy, depth of reasoning, and technical communication.
        </p>
      </div>

      {!activeSession ? (
        /* Create New Session View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 p-6 rounded-2xl bg-synapse-surface border border-synapse-border space-y-6">
            <h2 className="text-base font-display font-bold text-synapse-text">Initialize Mock Interview</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-synapse-subtle uppercase mb-2">
                  Select Technical Domain Topic
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['Backend Architecture', 'Data Structures & Algorithms', 'System Design'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTopic(t)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        topic === t
                          ? 'border-synapse-lime bg-synapse-lime/10 text-synapse-text font-semibold'
                          : 'border-synapse-border bg-synapse-subsurface text-synapse-muted hover:text-synapse-text'
                      }`}
                    >
                      <div className="text-xs font-bold">{t}</div>
                      <div className="text-[10px] text-synapse-subtle mt-1 font-mono">3 Conceptual Probes</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => createSessionMutation.mutate()}
                disabled={createSessionMutation.isPending}
                className="px-6 py-3 rounded-xl bg-synapse-lime text-black font-semibold text-xs flex items-center space-x-2 hover:bg-synapse-lime/90 transition-colors shadow-lg shadow-synapse-lime/20"
              >
                {createSessionMutation.isPending ? (
                  <span>Initializing Probe Engine...</span>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Begin {topic} Interview</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Past Sessions List */}
          <div className="p-6 rounded-2xl bg-synapse-surface border border-synapse-border space-y-4">
            <h3 className="text-xs font-mono uppercase text-synapse-subtle font-semibold flex items-center space-x-2">
              <History className="w-4 h-4 text-synapse-subtle" />
              <span>Past Evaluated Sessions ({history.length})</span>
            </h3>

            <div className="space-y-2.5 max-h-[400px] overflow-y-auto">
              {history.map((s) => (
                <div key={s.id} className="p-3.5 rounded-xl bg-synapse-subsurface border border-synapse-border space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-synapse-text">
                    <span className="truncate">{s.title}</span>
                    <span className="font-mono text-synapse-lime ml-2">{Math.round(s.overall_score)}%</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-synapse-subtle">
                    <span>Technical: {s.technical_score}%</span>
                    <span>Clarity: {s.communication_score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Active Interview In-Progress */
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-synapse-surface border border-synapse-border space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-synapse-border">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-synapse-lime/10 text-synapse-lime border border-synapse-lime/20 font-bold uppercase">
                  Probe {activeQuestionIdx + 1} of {activeSession.questions.length}
                </span>
                <span className="text-xs text-synapse-subtle font-mono">{activeSession.topic}</span>
              </div>
              <button
                onClick={() => setActiveSession(null)}
                className="text-xs font-mono text-synapse-subtle hover:text-synapse-text"
              >
                Exit Session
              </button>
            </div>

            {/* Current Question */}
            <div className="p-4 rounded-xl bg-synapse-subsurface border border-synapse-border">
              <div className="text-[10px] font-mono text-synapse-subtle uppercase mb-1">Interviewer Inquiry:</div>
              <p className="text-sm font-semibold text-synapse-text leading-relaxed">
                {activeSession.questions[activeQuestionIdx]?.question_text}
              </p>
            </div>

            {/* Answer Input */}
            <div className="space-y-3">
              <label className="block text-xs font-mono text-synapse-subtle uppercase">
                Your Technical Explanation &amp; Rationale:
              </label>
              <textarea
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
                rows={6}
                disabled={!!lastFeedback}
                className="w-full bg-synapse-bg border border-synapse-border rounded-xl p-4 text-xs font-mono text-synapse-text leading-relaxed focus:outline-none focus:border-synapse-lime resize-none"
                placeholder="Structure your answer citing architectural principles, algorithmic complexity, and concrete trade-offs..."
              />
            </div>

            {/* Feedback / Evaluation Surface */}
            {lastFeedback && (
              <div className="p-5 rounded-xl bg-synapse-subsurface border border-synapse-border space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono uppercase text-synapse-lime font-bold flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Evaluation Complete</span>
                  </div>
                  <div className="flex space-x-3 font-mono text-xs">
                    <span className="text-synapse-lime">Technical: {lastFeedback.technical_score}%</span>
                    <span className="text-synapse-cyan">Conceptual Depth: {lastFeedback.conceptual_depth_score}%</span>
                    <span className="text-synapse-text">Clarity: {lastFeedback.communication_score}%</span>
                  </div>
                </div>

                <p className="text-xs text-synapse-muted leading-relaxed font-mono">
                  {lastFeedback.feedback_text}
                </p>

                {lastFeedback.strengths.length > 0 && (
                  <div className="text-xs text-synapse-lime font-mono">
                    <span className="font-bold">Strengths: </span>
                    {lastFeedback.strengths.join(' • ')}
                  </div>
                )}

                {lastFeedback.weaknesses.length > 0 && (
                  <div className="text-xs text-synapse-amber font-mono">
                    <span className="font-bold">Growth Opportunities: </span>
                    {lastFeedback.weaknesses.join(' • ')}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-synapse-border">
              {!lastFeedback ? (
                <button
                  disabled={!studentAnswer.trim() || answerMutation.isPending}
                  onClick={() => answerMutation.mutate()}
                  className="px-6 py-2.5 rounded-xl bg-synapse-lime text-black font-semibold text-xs flex items-center space-x-2 hover:bg-synapse-lime/90 transition-colors shadow-md shadow-synapse-lime/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit for Evaluation</span>
                </button>
              ) : activeQuestionIdx + 1 < activeSession.questions.length ? (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl bg-synapse-lime text-black font-semibold text-xs flex items-center space-x-2 hover:bg-synapse-lime/90 transition-colors"
                >
                  <span>Proceed to Next Probe</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setActiveSession(null)}
                  className="px-6 py-2.5 rounded-xl bg-synapse-lime text-black font-semibold text-xs flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Interview &amp; Save to Twin</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
