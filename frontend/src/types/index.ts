export interface User {
  id: number;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  has_profile: boolean;
}

export interface StudentProfile {
  id: number;
  user_id: number;
  full_name: string;
  university?: string;
  degree?: string;
  specialization?: string;
  graduation_year?: number;
  current_semester?: number;
  experience_level: string;
  target_role?: string;
  career_interests: string[];
  profile_completion: number;
  created_at: string;
  updated_at: string;
}

export interface StudentSkill {
  id: number;
  skill_id: number;
  name: string;
  slug: string;
  category: string;
  proficiency_score: number;
  confidence_score: number;
  evidence_count: number;
  self_reported_score?: number;
  assessed_score?: number;
  trend_direction: 'improving' | 'stable' | 'declining' | 'insufficient_evidence';
  velocity_score: number;
  last_assessed_at?: string;
}

export interface SkillEvidence {
  id: number;
  skill_id: number;
  skill_name: string;
  source_type: string;
  raw_score: number;
  normalized_score: number;
  difficulty_weight: number;
  evidence_quality: number;
  created_at: string;
}

export interface BlindSpotItem {
  skill_name: string;
  skill_slug: string;
  self_reported_score: number;
  assessed_score: number;
  discrepancy: number;
  nature: 'overestimation' | 'underestimation';
  explanation: string;
}

export interface DashboardOverview {
  full_name: string;
  overall_readiness: number;
  learning_momentum: number;
  career_alignment_score: number;
  interview_readiness_score: number;
  primary_target_role: string;
  next_best_action: {
    title: string;
    action: string;
    rationale: string;
    priority_skill: string;
    estimated_duration: string;
  };
  top_strengths: StudentSkill[];
  identified_bottlenecks: Array<{
    skill_slug: string;
    skill_name: string;
    current_score: number;
    affected_dependents: string[];
    severity: string;
    rationale: string;
  }>;
  blind_spots: BlindSpotItem[];
  recent_activity: Array<{
    id: number;
    title: string;
    description: string;
    event_type: string;
    created_at: string;
  }>;
  recent_changes: string[];
}

export interface TwinSnapshot {
  id: number;
  model_version: string;
  overall_readiness: number;
  learning_velocity: number;
  consistency_score: number;
  skill_state: Record<string, {
    proficiency_score: number;
    confidence_score: number;
    evidence_count: number;
  }>;
  role_alignment: Record<string, {
    alignment_score: number;
    readiness_score: number;
    evidence_coverage: number;
    strengths: string[];
    gaps: string[];
  }>;
  identified_bottlenecks: Array<{
    skill_slug: string;
    skill_name: string;
    current_score: number;
    affected_dependents: string[];
    severity: string;
    rationale: string;
  }>;
  identified_blindspots: BlindSpotItem[];
  change_summary?: string;
  created_at: string;
}

export interface CodingQuestion {
  id: number;
  title: string;
  slug: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  constraints?: string;
  starter_code: Record<string, string>;
  sample_test_cases: Array<{
    input: string;
    expected_output: string;
  }>;
}

export interface CodingSubmission {
  id: number;
  question_id: number;
  question_title: string;
  language: string;
  status: string;
  score: number;
  runtime_ms: number;
  memory_kb: number;
  test_cases_passed: number;
  total_test_cases: number;
  feedback?: string;
  detected_mistakes: string[];
  created_at: string;
}

export interface InterviewSession {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  topic: string;
  status: string;
  overall_score: number;
  technical_score: number;
  communication_score: number;
  clarity_score: number;
  feedback_summary?: string;
  created_at: string;
  questions: Array<{
    id: number;
    order_index: number;
    question_text: string;
    topic: string;
  }>;
}

export interface CareerRole {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  market_demand: string;
  alignment_score: number;
  readiness_score: number;
  evidence_coverage: number;
  strengths: string[];
  gaps: string[];
  explanation?: string;
  requirements: Array<{
    skill_name: string;
    skill_slug: string;
    category: string;
    importance_weight: number;
    expected_proficiency: number;
    student_proficiency: number;
    student_confidence: number;
    is_mandatory: boolean;
  }>;
}

export interface RoadmapTask {
  id: number;
  phase_number: number;
  phase_title: string;
  order_index: number;
  title: string;
  description: string;
  rationale?: string;
  priority: string;
  estimated_hours: number;
  prerequisites: string[];
  status: 'pending' | 'in_progress' | 'completed';
  completion_criteria?: string;
  completed_at?: string;
}

export interface LearningRoadmap {
  id: number;
  title: string;
  target_role_name: string;
  current_phase: number;
  total_phases: number;
  status: string;
  progress_percentage: number;
  tasks: RoadmapTask[];
}

export interface FutureSelfSimulation {
  current_readiness: number;
  projected_readiness: number;
  delta_readiness: number;
  target_role_slug: string;
  current_role_alignment: number;
  projected_role_alignment: number;
  delta_role_alignment: number;
  unlocked_competencies: string[];
  rationale: string;
  is_hypothetical: boolean;
}
