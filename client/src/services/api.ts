import {
  AuthResponse,
  User,
  StudentProfile,
  MentorProfile,
  Project,
  ProjectGoal,
  ProjectMilestone,
  ProjectTask,
  ProjectResource,
  ProjectNote,
  MentorshipRequest,
  MentorshipSession,
  Conversation,
  Message,
  Notification,
  Review,
  Report,
  AdminAnalytics,
  MentorFilters,
  CloudinaryUploadResult,
  UploadSignatureResponse,
  StudentOnboardingOptions,
  MentorOnboardingOptions,
  RecommendedMentor,
  MentorRecommendationCriteria
} from '../../../shared/types.js';
import {
  TARGET_TECHNOLOGIES,
  HELP_NEEDED_AREAS,
  SKILL_CATEGORIES,
  MENTOR_PRESET_SKILLS,
  MENTOR_PRESET_TECHNOLOGIES,
  MENTOR_PRESET_EXPERIENCE_HIGHLIGHTS,
  MENTOR_PRESET_TOPICS
} from '../constants/skills.js';

class ApiClient {
  private baseUrl = (
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE ||
    '/api'
  ).replace(/\/+$/, '');

  private getToken(): string | null {
    return localStorage.getItem('guidely_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${cleanEndpoint}`;

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      let errMessage = `HTTP ${response.status}`;
      try {
        const errData = await response.json();
        if (errData?.message) {
          errMessage = errData.message;
        } else if (errData?.error) {
          errMessage = errData.error;
        }
      } catch (_) {}
      throw new Error(errMessage);
    }

    const data = await response.json();
    return data.data !== undefined ? data.data : data;
  }

  private uploadWithProgress<T>(
    endpoint: string,
    formData: FormData,
    onProgress?: (progressPercent: number) => void
  ): Promise<T> {
    const token = this.getToken();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${cleanEndpoint}`;

    return new Promise<T>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);

      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      if (xhr.upload && onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        });
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const json = JSON.parse(xhr.responseText);
            resolve(json.data !== undefined ? json.data : json);
          } catch {
            resolve(xhr.response as any);
          }
        } else {
          try {
            const errJson = JSON.parse(xhr.responseText);
            reject(new Error(errJson.message || `HTTP ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status HTTP ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during media upload'));
      };

      xhr.send(formData);
    });
  }

  // --- Auth ---
  async login(credentials: { email: string; password?: string }): Promise<AuthResponse> {
    return await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async register(data: { email: string; password: string; fullName: string; role: 'STUDENT' | 'MENTOR' }): Promise<AuthResponse> {
    return await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async googleAuth(data: {
    idToken?: string;
    credential?: string;
    code?: string;
    role?: 'STUDENT' | 'MENTOR';
    email?: string;
    fullName?: string;
    avatarUrl?: string;
  }): Promise<AuthResponse> {
    return await this.request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getCurrentUser(): Promise<User> {
    return await this.request<User>('/auth/me');
  }

  async forgotPassword(email: string): Promise<{ message: string; resetToken: string; demoResetToken?: string }> {
    return await this.request<{ message: string; resetToken: string; demoResetToken?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return await this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password })
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.request<void>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  // --- Student ---
  async getStudentProfile(): Promise<StudentProfile> {
    return await this.request<StudentProfile>('/students/profile');
  }

  async updateStudentProfile(data: Partial<StudentProfile>): Promise<StudentProfile> {
    return await this.request<StudentProfile>('/students/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async saveStudentOnboardingStep(step: number, data: Partial<StudentProfile>): Promise<StudentProfile> {
    return await this.request<StudentProfile>(`/students/onboarding/step/${step}`, {
      method: 'POST',
      body: JSON.stringify({ data })
    });
  }

  async getStudentOnboardingOptions(): Promise<StudentOnboardingOptions> {
    try {
      return await this.request<StudentOnboardingOptions>('/students/onboarding-options');
    } catch {
      return {
        targetTechnologies: [...TARGET_TECHNOLOGIES],
        helpNeededAreas: [...HELP_NEEDED_AREAS],
        skillCategories: [...SKILL_CATEGORIES]
      };
    }
  }

  async getAvailableSkills(query?: string, category?: string): Promise<{ skills: Array<{ name: string; category: string; isCustom?: boolean }>; categories: string[]; total: number }> {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (category && category !== 'All') params.append('category', category);
      const qs = params.toString() ? `?${params.toString()}` : '';
      return await this.request<{ skills: Array<{ name: string; category: string; isCustom?: boolean }>; categories: string[]; total: number }>(`/students/skills${qs}`);
    } catch {
      return { skills: [], categories: [], total: 0 };
    }
  }

  async addCustomSkill(skill: string): Promise<{ profile: StudentProfile; addedSkill: string }> {
    return await this.request<{ profile: StudentProfile; addedSkill: string }>('/students/skills/custom', {
      method: 'POST',
      body: JSON.stringify({ skill })
    });
  }

  async recommendMentors(criteria: MentorRecommendationCriteria = {}): Promise<RecommendedMentor[]> {
    return await this.request<RecommendedMentor[]>('/students/recommend-mentors', {
      method: 'POST',
      body: JSON.stringify(criteria)
    });
  }

  rankMockMentors(_criteria: MentorRecommendationCriteria = {}): RecommendedMentor[] {
    return [];
  }

  async getStudentDashboard(): Promise<any> {
    return await this.request<any>('/students/dashboard');
  }

  // --- Mentor ---
  async getMentorProfile(): Promise<MentorProfile> {
    return await this.request<MentorProfile>('/mentors/profile');
  }

  async updateMentorProfile(data: Partial<MentorProfile>): Promise<MentorProfile> {
    return await this.request<MentorProfile>('/mentors/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async saveMentorOnboardingStep(step: number, data: Partial<MentorProfile>): Promise<MentorProfile> {
    return await this.request<MentorProfile>(`/mentors/onboarding/step/${step}`, {
      method: 'POST',
      body: JSON.stringify({ data })
    });
  }

  async getMentorOnboardingOptions(): Promise<MentorOnboardingOptions> {
    try {
      return await this.request<MentorOnboardingOptions>('/mentors/onboarding-options');
    } catch {
      return {
        presetSkills: [...MENTOR_PRESET_SKILLS],
        presetTechnologies: [...MENTOR_PRESET_TECHNOLOGIES],
        presetExperienceHighlights: [...MENTOR_PRESET_EXPERIENCE_HIGHLIGHTS],
        presetTopics: [...MENTOR_PRESET_TOPICS]
      };
    }
  }

  async getMentorsList(filters: MentorFilters = {}): Promise<{ mentors: Array<MentorProfile & { user: User }>; total: number }> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.minExperience) params.append('minExperience', filters.minExperience.toString());
    if (filters.minRating) params.append('minRating', filters.minRating.toString());
    if (filters.company) params.append('company', filters.company);
    if (filters.availability) params.append('availability', filters.availability);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.technologies && filters.technologies.length > 0) params.append('technologies', filters.technologies.join(','));
    if (filters.skills && filters.skills.length > 0) params.append('skills', filters.skills.join(','));
    if (filters.topics && filters.topics.length > 0) params.append('topics', filters.topics.join(','));

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await this.request<any>(`/mentors/discover${qs}`);
    if (Array.isArray(res)) {
      return { mentors: res, total: res.length };
    }
    return res || { mentors: [], total: 0 };
  }

  async discoverMentors(filters: MentorFilters = {}): Promise<Array<MentorProfile & { user: User }>> {
    const res = await this.getMentorsList(filters);
    return res.mentors || (Array.isArray(res) ? res : []);
  }

  async getMentorDetail(id: string): Promise<{ mentor: MentorProfile & { user: User }; reviews: Review[]; studentsHelped: any[] }> {
    return await this.request<{ mentor: MentorProfile & { user: User }; reviews: Review[]; studentsHelped: any[] }>(`/mentors/detail/${id}`);
  }

  async getMentorDashboard(): Promise<any> {
    return await this.request<any>('/mentors/dashboard');
  }

  async getMentorActiveStudents(): Promise<{
    activeProjects: any[];
    incomingRequestsCount: number;
    stats: {
      totalStudents: number;
      avgProgress: number;
      milestonesCompleted: number;
      upcomingSessionsCount: number;
    };
  }> {
    const dashboard = await this.getMentorDashboard();
    const activeProjects = dashboard.activeProjects || dashboard.activeMentees || [];
    const incomingRequests = dashboard.incomingRequests || dashboard.pendingRequests || [];
    const upcomingSessions = dashboard.upcomingSessions || [];

    const totalProgress = activeProjects.reduce((acc: number, p: any) => acc + (p.progressPercentage || p.progress_percentage || 0), 0);
    const avgProgress = activeProjects.length > 0 ? Math.round(totalProgress / activeProjects.length) : 0;

    let milestonesCompleted = 0;
    activeProjects.forEach((p: any) => {
      if (Array.isArray(p.milestones)) {
        milestonesCompleted += p.milestones.filter((m: any) => m.status === 'COMPLETED').length;
      }
    });

    return {
      activeProjects,
      incomingRequestsCount: incomingRequests.length,
      stats: {
        totalStudents: activeProjects.length,
        avgProgress,
        milestonesCompleted,
        upcomingSessionsCount: upcomingSessions.length
      }
    };
  }

  // --- Mentorship Requests ---
  async createMentorshipRequest(data: {
    mentorId: string;
    projectTitle: string;
    projectDescription: string;
    currentKnowledge: string;
    techKnown: string[];
    helpNeeded: string[];
    expectedOutcome: string;
    preferredTimes: string;
    additionalMessage?: string;
  }): Promise<MentorshipRequest> {
    return await this.request<MentorshipRequest>('/mentorship/request', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getStudentRequests(): Promise<MentorshipRequest[]> {
    return await this.request<MentorshipRequest[]>('/mentorship/student-requests');
  }

  async getMentorRequests(): Promise<MentorshipRequest[]> {
    return await this.request<MentorshipRequest[]>('/mentorship/mentor-requests');
  }

  async respondToRequest(requestId: string, action: 'ACCEPT' | 'REJECT' | 'REQUEST_INFO', notes?: string): Promise<MentorshipRequest> {
    return await this.request<MentorshipRequest>(`/mentorship/request/${requestId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action, notes })
    });
  }

  async provideAdditionalRequestInfo(requestId: string, additionalMessage: string): Promise<MentorshipRequest> {
    return await this.request<MentorshipRequest>(`/mentorship/request/${requestId}/info`, {
      method: 'POST',
      body: JSON.stringify({ additionalMessage })
    });
  }

  // --- Project Workspace ---
  async getMyProjects(): Promise<Project[]> {
    return await this.request<Project[]>('/projects/my-projects');
  }

  async getProjectWorkspace(projectId: string): Promise<{
    project: Project;
    goals: ProjectGoal[];
    milestones: ProjectMilestone[];
    tasks: ProjectTask[];
    resources: ProjectResource[];
    notes: ProjectNote[];
  }> {
    return await this.request<any>(`/projects/${projectId}`);
  }

  async updateProject(projectId: string, data: Partial<Project>): Promise<Project> {
    return await this.request<Project>(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Goals
  async addGoal(projectId: string, data: { title: string; description?: string; targetDate?: string }): Promise<ProjectGoal> {
    return await this.request<ProjectGoal>(`/projects/${projectId}/goals`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateGoal(projectId: string, goalId: string, data: Partial<ProjectGoal>): Promise<ProjectGoal> {
    return await this.request<ProjectGoal>(`/projects/${projectId}/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteGoal(projectId: string, goalId: string): Promise<void> {
    await this.request<void>(`/projects/${projectId}/goals/${goalId}`, {
      method: 'DELETE'
    });
  }

  // Milestones
  async addMilestone(projectId: string, data: { title: string; description?: string; dueDate?: string }): Promise<ProjectMilestone> {
    return await this.request<ProjectMilestone>(`/projects/${projectId}/milestones`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateMilestone(projectId: string, milestoneId: string, data: Partial<ProjectMilestone>): Promise<ProjectMilestone> {
    return await this.request<ProjectMilestone>(`/projects/${projectId}/milestones/${milestoneId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteMilestone(projectId: string, milestoneId: string): Promise<void> {
    await this.request<void>(`/projects/${projectId}/milestones/${milestoneId}`, {
      method: 'DELETE'
    });
  }

  // Tasks
  async addTask(projectId: string, data: {
    title: string;
    description?: string;
    milestoneId?: string;
    assigneeRole: 'STUDENT' | 'MENTOR';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    dueDate?: string;
  }): Promise<ProjectTask> {
    return await this.request<ProjectTask>(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateTask(projectId: string, taskId: string, data: Partial<ProjectTask>): Promise<ProjectTask> {
    return await this.request<ProjectTask>(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteTask(projectId: string, taskId: string): Promise<void> {
    await this.request<void>(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE'
    });
  }

  // Resources
  async addResource(projectId: string, data: { title: string; url: string; type: any }): Promise<ProjectResource> {
    return await this.request<ProjectResource>(`/projects/${projectId}/resources`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async deleteResource(projectId: string, resourceId: string): Promise<void> {
    await this.request<void>(`/projects/${projectId}/resources/${resourceId}`, {
      method: 'DELETE'
    });
  }

  // Notes
  async addNote(projectId: string, data: { title: string; content: string; isPrivateToMentor: boolean }): Promise<ProjectNote> {
    return await this.request<ProjectNote>(`/projects/${projectId}/notes`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateNote(projectId: string, noteId: string, data: Partial<ProjectNote>): Promise<ProjectNote> {
    return await this.request<ProjectNote>(`/projects/${projectId}/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteNote(projectId: string, noteId: string): Promise<void> {
    await this.request<void>(`/projects/${projectId}/notes/${noteId}`, {
      method: 'DELETE'
    });
  }

  // --- Sessions ---
  async requestSession(data: {
    mentorId: string;
    projectId?: string;
    title: string;
    agenda: string;
    scheduledAt: string;
    durationMinutes?: number;
  }): Promise<MentorshipSession> {
    return await this.request<MentorshipSession>('/sessions/request', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getMySessions(): Promise<MentorshipSession[]> {
    return await this.request<MentorshipSession[]>('/sessions/my-sessions');
  }

  async confirmSession(sessionId: string, meetingUrl?: string): Promise<MentorshipSession> {
    return await this.request<MentorshipSession>(`/sessions/${sessionId}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ meetingUrl })
    });
  }

  async rescheduleSession(sessionId: string, scheduledAt: string): Promise<MentorshipSession> {
    return await this.request<MentorshipSession>(`/sessions/${sessionId}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ scheduledAt })
    });
  }

  async cancelSession(sessionId: string, reason?: string): Promise<MentorshipSession> {
    return await this.request<MentorshipSession>(`/sessions/${sessionId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  async completeSession(sessionId: string, sessionNotes: string): Promise<MentorshipSession> {
    return await this.request<MentorshipSession>(`/sessions/${sessionId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ sessionNotes })
    });
  }

  async submitSessionFeedback(sessionId: string, feedback: string, rating: number): Promise<MentorshipSession> {
    return await this.request<MentorshipSession>(`/sessions/${sessionId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ feedback, rating })
    });
  }

  // --- Messaging ---
  async getConversations(): Promise<Conversation[]> {
    return await this.request<Conversation[]>('/messaging/conversations');
  }

  async getOrCreateConversation(studentId: string, mentorId: string): Promise<Conversation> {
    return await this.request<Conversation>('/messaging/conversations/get-or-create', {
      method: 'POST',
      body: JSON.stringify({ studentId, mentorId })
    });
  }

  async getMessages(conversationId: string): Promise<{ conversation: Conversation; messages: Message[] }> {
    return await this.request<any>(`/messaging/conversations/${conversationId}/messages`);
  }

  async sendMessage(conversationId: string, data: { text: string; attachments?: any[] }): Promise<Message> {
    return await this.request<Message>(`/messaging/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async markConversationRead(conversationId: string): Promise<void> {
    await this.request<void>(`/messaging/conversations/${conversationId}/read`, {
      method: 'POST'
    });
  }

  // --- Notifications ---
  async getNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
    const res = await this.request<any>('/notifications');
    if (Array.isArray(res)) {
      const unreadCount = res.filter((n: Notification) => !n.isRead).length;
      return { notifications: res, unreadCount };
    }
    return res || { notifications: [], unreadCount: 0 };
  }

  async markNotificationRead(id: string): Promise<void> {
    await this.request<void>(`/notifications/${id}/read`, {
      method: 'POST'
    });
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.request<void>('/notifications/read-all', {
      method: 'POST'
    });
  }

  // --- Reviews ---
  async getMentorReviews(mentorId: string): Promise<Review[]> {
    return await this.request<Review[]>(`/reviews/mentor/${mentorId}`);
  }

  async submitReview(data: { mentorId: string; projectId?: string; rating: number; comment: string }): Promise<Review> {
    return await this.request<Review>('/reviews/submit', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // --- Admin ---
  async getAdminOverview(): Promise<AdminAnalytics> {
    return await this.request<AdminAnalytics>('/admin/overview');
  }

  async getAdminUsers(filters: { search?: string; role?: string; status?: string; page?: number; limit?: number }): Promise<{ users: User[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    return await this.request<any>(`/admin/users?${params.toString()}`);
  }

  async toggleUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<User> {
    return await this.request<User>(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  async getPendingVerifications(): Promise<(MentorProfile & { user: User })[]> {
    return await this.request<(MentorProfile & { user: User })[]>('/admin/verifications');
  }

  async verifyMentor(userId: string, status: 'APPROVED' | 'REJECTED', notes?: string): Promise<MentorProfile> {
    return await this.request<MentorProfile>(`/admin/verifications/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ status, notes })
    });
  }

  async getAdminProjects(): Promise<any[]> {
    return await this.request<any[]>('/admin/projects');
  }

  async getAdminReports(): Promise<Report[]> {
    return await this.request<Report[]>('/admin/reports');
  }

  async createReport(data: { reportedUserId?: string; reportType: string; reason: string; details: string }): Promise<Report> {
    return await this.request<Report>('/admin/reports/create', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async resolveReport(reportId: string, status: 'RESOLVED' | 'DISMISSED', adminNotes?: string): Promise<Report> {
    return await this.request<Report>(`/admin/reports/${reportId}/resolve`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNotes })
    });
  }

  async getReviewsForModeration(): Promise<Review[]> {
    return await this.request<Review[]>('/admin/reviews');
  }

  async moderateReview(reviewId: string, isApproved: boolean): Promise<void> {
    await this.request<void>(`/admin/reviews/${reviewId}/moderate`, {
      method: 'PUT',
      body: JSON.stringify({ isApproved })
    });
  }

  // --- Cloudinary Media & Upload ---
  async uploadProfilePhoto(
    file: File,
    onProgress?: (pct: number) => void
  ): Promise<{ url: string; secureUrl: string; publicId: string; user: User }> {
    const formData = new FormData();
    formData.append('file', file);
    return await this.uploadWithProgress<any>('/upload/profile-photo', formData, onProgress);
  }

  async deleteProfilePhoto(): Promise<{ user: User }> {
    return await this.request<any>('/upload/profile-photo', {
      method: 'DELETE'
    });
  }

  async uploadMedia(
    file: File,
    folder: 'projects' | 'videos' | 'documents' | 'messages' | 'general' = 'general',
    onProgress?: (pct: number) => void,
    projectId?: string
  ): Promise<CloudinaryUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    if (projectId) {
      formData.append('projectId', projectId);
    }
    return await this.uploadWithProgress<CloudinaryUploadResult>('/upload/media', formData, onProgress);
  }

  async deleteMedia(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<{ success: boolean }> {
    return await this.request<any>('/upload/media', {
      method: 'DELETE',
      body: JSON.stringify({ publicId, resourceType })
    });
  }

  async getUploadSignature(folder: string = 'guidely/general'): Promise<UploadSignatureResponse> {
    return await this.request<UploadSignatureResponse>('/upload/signature', {
      method: 'POST',
      body: JSON.stringify({ folder })
    });
  }

  async getUploadStatus(): Promise<{ isConfigured: boolean; cloudName: string; apiKeyPrefix: string }> {
    return await this.request<any>('/upload/status');
  }
}

export const api = new ApiClient();
