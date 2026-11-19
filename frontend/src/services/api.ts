import {
  DashboardOverview,
  TwinSnapshot,
  StudentSkill,
  CodingQuestion,
  CodingSubmission,
  InterviewSession,
  CareerRole,
  LearningRoadmap,
  RoadmapTask,
  FutureSelfSimulation,
  StudentProfile
} from '../types';

const API_BASE = '/api/v1';

class ApiClient {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('synapse_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...options.headers,
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      localStorage.removeItem('synapse_token');
      localStorage.removeItem('synapse_user');
      window.dispatchEvent(new Event('synapse_auth_change'));
    }

    if (!res.ok) {
      let errorMsg = `HTTP Error ${res.status}`;
      try {
        const errJson = await res.json();
        errorMsg = errJson.detail || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    return res.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ access_token: string; refresh_token: string; full_name: string; email: string; user_id: number; has_profile: boolean }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    );
  }

  async register(email: string, password: string, full_name: string) {
    return this.request<{ access_token: string; refresh_token: string; full_name: string; email: string; user_id: number; has_profile: boolean }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify({ email, password, full_name }) }
    );
  }

  async getMe() {
    return this.request<{ id: number; email: string; is_active: boolean; is_verified: boolean; has_profile: boolean }>(
      '/auth/me'
    );
  }

  // Student Profile & Onboarding
  async getProfile(): Promise<StudentProfile> {
    return this.request<StudentProfile>('/students/me');
  }

  async completeOnboarding(data: Partial<StudentProfile> & { declared_skills?: any[] }): Promise<StudentProfile> {
    return this.request<StudentProfile>('/students/onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Dashboard
  async getDashboardOverview(): Promise<DashboardOverview> {
    return this.request<DashboardOverview>('/dashboard/overview');
  }

  // Digital Twin
  async getCurrentTwin(): Promise<TwinSnapshot> {
    return this.request<TwinSnapshot>('/digital-twin/me');
  }

  async getTwinHistory(): Promise<TwinSnapshot[]> {
    return this.request<TwinSnapshot[]>('/digital-twin/me/history');
  }

  async simulateFutureSelf(hypotheticalSkills: Record<string, number>, targetRoleSlug = 'backend-developer'): Promise<FutureSelfSimulation> {
    return this.request<FutureSelfSimulation>('/digital-twin/me/simulate', {
      method: 'POST',
      body: JSON.stringify({ hypothetical_skills: hypotheticalSkills, target_role_slug: targetRoleSlug }),
    });
  }

  // Skills
  async getMySkills(): Promise<StudentSkill[]> {
    return this.request<StudentSkill[]>('/skills/me');
  }

  async getMasterSkills(): Promise<any[]> {
    return this.request<any[]>('/skills');
  }

  async getSkillDetail(slug: string): Promise<any> {
    return this.request<any>(`/skills/me/${slug}`);
  }

  // Coding Lab
  async getCodingQuestions(): Promise<CodingQuestion[]> {
    return this.request<CodingQuestion[]>('/coding/questions');
  }

  async getCodingQuestion(slug: string): Promise<CodingQuestion> {
    return this.request<CodingQuestion>(`/coding/questions/${slug}`);
  }

  async submitCode(questionId: number, language: string, code: string): Promise<CodingSubmission> {
    return this.request<CodingSubmission>('/coding/submissions', {
      method: 'POST',
      body: JSON.stringify({ question_id: questionId, language, code }),
    });
  }

  async getMySubmissions(): Promise<CodingSubmission[]> {
    return this.request<CodingSubmission[]>('/coding/submissions/me');
  }

  // Interview Studio
  async createInterviewSession(topic: string, category = 'technical', difficulty = 'intermediate'): Promise<InterviewSession> {
    return this.request<InterviewSession>('/interviews/sessions', {
      method: 'POST',
      body: JSON.stringify({ topic, category, difficulty }),
    });
  }

  async submitInterviewAnswer(questionId: number, studentAnswer: string): Promise<any> {
    return this.request<any>('/interviews/answers', {
      method: 'POST',
      body: JSON.stringify({ question_id: questionId, student_answer: studentAnswer }),
    });
  }

  async getInterviewHistory(): Promise<InterviewSession[]> {
    return this.request<InterviewSession[]>('/interviews/history');
  }

  // Career Explorer
  async getCareerRoles(): Promise<CareerRole[]> {
    return this.request<CareerRole[]>('/careers/roles');
  }

  async compareCareers(roleIds: number[]): Promise<{ roles: CareerRole[]; shared_skills: string[] }> {
    return this.request<{ roles: CareerRole[]; shared_skills: string[] }>('/careers/compare', {
      method: 'POST',
      body: JSON.stringify({ role_ids: roleIds }),
    });
  }

  // Adaptive Roadmap
  async getRoadmap(): Promise<LearningRoadmap> {
    return this.request<LearningRoadmap>('/roadmaps/me');
  }

  async generateRoadmap(targetRoleName?: string): Promise<LearningRoadmap> {
    return this.request<LearningRoadmap>('/roadmaps/generate', {
      method: 'POST',
      body: JSON.stringify({ target_role_name: targetRoleName }),
    });
  }

  async toggleRoadmapTask(taskId: number): Promise<RoadmapTask> {
    return this.request<RoadmapTask>(`/roadmaps/tasks/${taskId}/toggle`, {
      method: 'POST',
    });
  }

  // Analytics
  async getAnalytics(): Promise<any> {
    return this.request<any>('/analytics/overview');
  }
}

export const api = new ApiClient();
