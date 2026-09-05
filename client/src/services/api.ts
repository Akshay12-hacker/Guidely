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
  RecommendedMentor,
  MentorRecommendationCriteria
} from '../../../shared/types.js';
import { TARGET_TECHNOLOGIES, HELP_NEEDED_AREAS, SKILL_CATEGORIES } from '../constants/skills.js';

import {
  MOCK_USERS,
  MOCK_STUDENT_PROFILES,
  MOCK_MENTOR_PROFILES,
  MOCK_PROJECTS,
  MOCK_PROJECT_WORKSPACES,
  MOCK_REQUESTS,
  MOCK_SESSIONS,
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
  MOCK_REVIEWS,
  MOCK_NOTIFICATIONS,
  MOCK_ADMIN_ANALYTICS,
  MOCK_REPORTS
} from './mockData.js';

// In-memory state containers that allow full live interaction during demo
let dynamicUsers = { ...MOCK_USERS };
let dynamicStudentProfiles = { ...MOCK_STUDENT_PROFILES };
let dynamicMentorProfiles = { ...MOCK_MENTOR_PROFILES };
let dynamicProjects = { ...MOCK_PROJECTS };
let dynamicWorkspaces = { ...MOCK_PROJECT_WORKSPACES };
let dynamicRequests = [...MOCK_REQUESTS];
let dynamicSessions = [...MOCK_SESSIONS];
let dynamicConversations = [...MOCK_CONVERSATIONS];
let dynamicMessages = { ...MOCK_MESSAGES };
let dynamicReviews = [...MOCK_REVIEWS];
let dynamicNotifications = [...MOCK_NOTIFICATIONS];
let dynamicReports = [...MOCK_REPORTS];

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

  private getCurrentMockUserId(): string {
    const token = this.getToken();
    if (token && token.startsWith('mock_token_')) {
      const id = token.replace('mock_token_', '');
      if (dynamicUsers[id]) return id;
    }
    // Default to Akshay (Student Lead)
    return 'usr_student_akshay';
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

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.data !== undefined ? data.data : data;
    } catch (err) {
      // If backend is not available, we throw so callers fallback to mock logic
      throw err;
    }
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
    try {
      return await this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
    } catch {
      // Mock Fallback
      const email = credentials.email.toLowerCase();
      const user = Object.values(dynamicUsers).find(u => u.email.toLowerCase() === email) || dynamicUsers['usr_student_akshay'];
      const token = `mock_token_${user.id}`;
      const profile = user.role === 'STUDENT' ? dynamicStudentProfiles[user.id] : dynamicMentorProfiles[user.id];
      return { user, token, profile };
    }
  }

  async register(data: { email: string; password: string; fullName: string; role: 'STUDENT' | 'MENTOR' }): Promise<AuthResponse> {
    try {
      return await this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      const id = `usr_${data.role.toLowerCase()}_${Date.now()}`;
      const newUser: User = {
        id,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        status: 'ACTIVE',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.fullName)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      dynamicUsers[id] = newUser;
      const token = `mock_token_${id}`;
      return { user: newUser, token };
    }
  }

  async googleAuth(data: { email: string; fullName: string; role?: 'STUDENT' | 'MENTOR'; avatarUrl?: string }): Promise<AuthResponse> {
    try {
      return await this.request<AuthResponse>('/auth/google', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      const email = data.email.toLowerCase();
      let user = Object.values(dynamicUsers).find(u => u.email.toLowerCase() === email);
      if (!user) {
        const id = `usr_${(data.role || 'STUDENT').toLowerCase()}_${Date.now()}`;
        user = {
          id,
          email: data.email,
          fullName: data.fullName,
          role: data.role || 'STUDENT',
          status: 'ACTIVE',
          avatarUrl: data.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.fullName)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        dynamicUsers[id] = user;
      }
      const token = `mock_token_${user.id}`;
      return { user, token };
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      return await this.request<User>('/auth/me');
    } catch {
      const uid = this.getCurrentMockUserId();
      return dynamicUsers[uid] || dynamicUsers['usr_student_akshay'];
    }
  }

  async forgotPassword(email: string): Promise<{ message: string; demoResetToken: string }> {
    return { message: 'Reset token generated for demo presentation', demoResetToken: 'demo-reset-token-2026' };
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return { message: 'Password reset successfully!' };
  }

  // --- Student ---
  async getStudentProfile(): Promise<StudentProfile> {
    try {
      return await this.request<StudentProfile>('/students/profile');
    } catch {
      const uid = this.getCurrentMockUserId();
      return dynamicStudentProfiles[uid] || dynamicStudentProfiles['usr_student_akshay'];
    }
  }

  async updateStudentProfile(data: Partial<StudentProfile>): Promise<StudentProfile> {
    try {
      return await this.request<StudentProfile>('/students/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch {
      const uid = this.getCurrentMockUserId();
      if (!dynamicStudentProfiles[uid]) {
        dynamicStudentProfiles[uid] = {
          userId: uid,
          college: 'SAGE University Bhopal',
          degree: 'B.Tech CSE',
          graduationYear: 2026,
          currentSkills: [],
          projectIdea: '',
          targetTechnologies: [],
          helpNeededAreas: [],
          availability: '',
          onboardingStep: 6,
          isCompleted: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      dynamicStudentProfiles[uid] = { ...dynamicStudentProfiles[uid], ...data, updatedAt: new Date().toISOString() };
      return dynamicStudentProfiles[uid];
    }
  }

  async saveStudentOnboardingStep(step: number, data: Partial<StudentProfile>): Promise<StudentProfile> {
    return this.updateStudentProfile({ ...data, onboardingStep: step });
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
    try {
      return await this.request<{ profile: StudentProfile; addedSkill: string }>('/students/skills/custom', {
        method: 'POST',
        body: JSON.stringify({ skill })
      });
    } catch {
      const uid = this.getCurrentMockUserId();
      const prof = dynamicStudentProfiles[uid] || dynamicStudentProfiles['usr_student_akshay'];
      const current = prof?.currentSkills || [];
      if (!current.includes(skill)) {
        prof.currentSkills = [...current, skill];
      }
      return { profile: prof, addedSkill: skill };
    }
  }

  rankMockMentors(criteria: MentorRecommendationCriteria = {}): RecommendedMentor[] {
    const targetTech = (criteria.targetTechnologies || []).map(t => t.toLowerCase());
    const helpAreas = (criteria.helpNeededAreas || []).map(h => h.toLowerCase());
    const projectWords = (criteria.projectIdea || criteria.query || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);
    const prefs = (criteria.preferences || '').toLowerCase();

    const scored = Object.values(dynamicMentorProfiles).map(m => {
      const user = dynamicUsers[m.userId] || {
        id: m.userId,
        fullName: m.title,
        avatarUrl: undefined,
        headline: m.company,
        role: 'MENTOR' as const,
        status: 'ACTIVE' as const,
        email: `${m.userId}@guidely.app`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let score = 50;
      const matchReasons: string[] = [];
      const matchedTechnologies: string[] = [];
      const matchedTopics: string[] = [];

      const mentorAllTech = [...(m.technologies || []), ...(m.skills || [])];
      const mentorTopics = m.mentoringTopics || [];
      const mentorText = `${m.bio} ${m.title} ${m.company}`.toLowerCase();

      if (targetTech.length > 0) {
        targetTech.forEach(tt => {
          if (tt.includes('no idea')) return;
          const found = mentorAllTech.find(mt => {
            const lmt = mt.toLowerCase();
            return lmt.includes(tt) || tt.includes(lmt);
          });
          if (found && !matchedTechnologies.includes(found)) {
            matchedTechnologies.push(found);
            score += 10;
          }
        });
        if (matchedTechnologies.length > 0) {
          matchReasons.push(`Expertise in your target stack: ${matchedTechnologies.slice(0, 3).join(', ')}`);
        }
      }

      if (helpAreas.length > 0) {
        helpAreas.forEach(ha => {
          if (ha.includes('no idea')) return;
          const found = mentorTopics.find(mt => {
            const lmt = mt.toLowerCase();
            return lmt.includes(ha) || ha.includes(lmt);
          });
          if (found && !matchedTopics.includes(found)) {
            matchedTopics.push(found);
            score += 8;
          }
        });
        if (matchedTopics.length > 0) {
          matchReasons.push(`Direct guidance in: ${matchedTopics.slice(0, 2).join(', ')}`);
        }
      }

      if (projectWords.length > 0) {
        let hits = 0;
        projectWords.forEach(pw => {
          if (mentorText.includes(pw) || mentorAllTech.some(t => t.toLowerCase().includes(pw))) {
            hits++;
            score += 3;
          }
        });
        if (hits >= 2) {
          matchReasons.push(`Specialized domain experience aligned with your project`);
        }
      }

      if (prefs && mentorText.includes(prefs)) {
        score += 8;
        matchReasons.push(`Matches your preference for ${m.company}`);
      }

      score += Math.max(0, ((m.rating || 5.0) - 4.5) * 8);
      score += Math.min(6, (m.yearsExperience || 0) * 0.6);

      if (matchReasons.length === 0) {
        matchReasons.push(`${m.yearsExperience}+ years engineering experience at ${m.company}`);
      }

      const finalScore = Math.min(99, Math.max(60, Math.round(score)));

      return {
        id: user.id || m.userId,
        userId: m.userId,
        full_name: user.fullName,
        fullName: user.fullName,
        avatar_url: user.avatarUrl,
        avatarUrl: user.avatarUrl,
        headline: user.headline,
        title: m.title,
        company: m.company,
        college: m.college,
        years_experience: m.yearsExperience,
        yearsExperience: m.yearsExperience,
        skills: m.skills || [],
        technologies: m.technologies || [],
        mentoringTopics: m.mentoringTopics || [],
        rating: m.rating || 5.0,
        reviews_count: m.reviewsCount || 0,
        reviewsCount: m.reviewsCount || 0,
        students_helped_count: m.studentsHelpedCount || 0,
        studentsHelpedCount: m.studentsHelpedCount || 0,
        availability_schedule: m.availabilitySchedule || '',
        availabilitySchedule: m.availabilitySchedule || '',
        matchScore: finalScore,
        matchReasons,
        matchedTechnologies,
        matchedTopics,
        user
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    return scored;
  }

  async getStudentDashboard(): Promise<any> {
    try {
      return await this.request<any>('/students/dashboard');
    } catch {
      const uid = this.getCurrentMockUserId();
      const profile = dynamicStudentProfiles[uid] || dynamicStudentProfiles['usr_student_akshay'];
      const activeProject = Object.values(dynamicProjects).find(p => p.studentId === uid) || dynamicProjects['proj_guidely_pbl'];
      const nextSession = dynamicSessions.find(s => s.studentId === uid && s.status === 'CONFIRMED') || dynamicSessions[0];
      const pendingRequests = dynamicRequests.filter(r => r.studentId === uid);
      const recommendedMentors = this.rankMockMentors({
        targetTechnologies: profile?.targetTechnologies,
        helpNeededAreas: profile?.helpNeededAreas,
        projectIdea: profile?.projectIdea || activeProject?.title || activeProject?.description,
        currentSkills: profile?.currentSkills
      }).slice(0, 4);

      return {
        profile,
        profileCompletionPercentage: 100,
        activeProject,
        nextSession,
        pendingRequests,
        recommendedMentors
      };
    }
  }

  async recommendMentors(criteria: MentorRecommendationCriteria = {}): Promise<RecommendedMentor[]> {
    try {
      return await this.request<RecommendedMentor[]>('/students/recommend-mentors', {
        method: 'POST',
        body: JSON.stringify(criteria)
      });
    } catch {
      const uid = this.getCurrentMockUserId();
      const profile = dynamicStudentProfiles[uid] || dynamicStudentProfiles['usr_student_akshay'];
      const mergedCriteria: MentorRecommendationCriteria = {
        targetTechnologies: criteria.targetTechnologies?.length ? criteria.targetTechnologies : profile?.targetTechnologies,
        helpNeededAreas: criteria.helpNeededAreas?.length ? criteria.helpNeededAreas : profile?.helpNeededAreas,
        projectIdea: criteria.projectIdea || profile?.projectIdea || '',
        currentSkills: criteria.currentSkills?.length ? criteria.currentSkills : profile?.currentSkills,
        query: criteria.query || '',
        preferences: criteria.preferences || ''
      };
      return this.rankMockMentors(mergedCriteria);
    }
  }

  // --- Mentor ---
  async getMentorProfile(): Promise<MentorProfile> {
    try {
      return await this.request<MentorProfile>('/mentors/profile');
    } catch {
      const uid = this.getCurrentMockUserId();
      return dynamicMentorProfiles[uid] || dynamicMentorProfiles['usr_mentor_nitin'];
    }
  }

  async updateMentorProfile(data: Partial<MentorProfile>): Promise<MentorProfile> {
    try {
      return await this.request<MentorProfile>('/mentors/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch {
      const uid = this.getCurrentMockUserId();
      if (!dynamicMentorProfiles[uid]) {
        dynamicMentorProfiles[uid] = {
          userId: uid,
          title: 'Faculty Mentor',
          company: 'School of Computer Technology',
          college: 'SAGE University Bhopal',
          yearsExperience: 5,
          bio: '',
          skills: [],
          technologies: [],
          mentoringTopics: [],
          availabilitySchedule: '',
          hourlyRate: 0,
          isVerified: true,
          verificationStatus: 'APPROVED',
          rating: 5.0,
          reviewsCount: 1,
          studentsHelpedCount: 1,
          onboardingStep: 9,
          isCompleted: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      dynamicMentorProfiles[uid] = { ...dynamicMentorProfiles[uid], ...data, updatedAt: new Date().toISOString() };
      return dynamicMentorProfiles[uid];
    }
  }

  async saveMentorOnboardingStep(step: number, data: Partial<MentorProfile>): Promise<MentorProfile> {
    return this.updateMentorProfile({ ...data, onboardingStep: step });
  }

  async discoverMentors(filters: MentorFilters): Promise<(MentorProfile & { user: User })[]> {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.minExperience) params.append('minExperience', filters.minExperience.toString());
      if (filters.minRating) params.append('minRating', filters.minRating.toString());
      if (filters.company) params.append('company', filters.company);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.technologies?.length) params.append('technologies', filters.technologies.join(','));
      if (filters.skills?.length) params.append('skills', filters.skills.join(','));

      return await this.request<(MentorProfile & { user: User })[]>(`/mentors/discover?${params.toString()}`);
    } catch {
      let list = Object.values(dynamicMentorProfiles).map(m => ({
        ...m,
        user: dynamicUsers[m.userId]
      })).filter(m => !!m.user);

      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(m =>
          m.user.fullName.toLowerCase().includes(q) ||
          m.title.toLowerCase().includes(q) ||
          m.company.toLowerCase().includes(q) ||
          m.skills.some(s => s.toLowerCase().includes(q)) ||
          m.technologies.some(t => t.toLowerCase().includes(q))
        );
      }

      if (filters.minExperience) {
        list = list.filter(m => m.yearsExperience >= filters.minExperience!);
      }

      if (filters.minRating) {
        list = list.filter(m => m.rating >= filters.minRating!);
      }

      if (filters.company) {
        const comp = filters.company.toLowerCase();
        list = list.filter(m => m.company.toLowerCase().includes(comp));
      }

      if (filters.technologies && filters.technologies.length > 0) {
        list = list.filter(m =>
          filters.technologies!.some(t => m.technologies.map(x => x.toLowerCase()).includes(t.toLowerCase()))
        );
      }

      if (filters.sortBy === 'experience') {
        list.sort((a, b) => (filters.sortOrder === 'asc' ? a.yearsExperience - b.yearsExperience : b.yearsExperience - a.yearsExperience));
      } else if (filters.sortBy === 'students') {
        list.sort((a, b) => (filters.sortOrder === 'asc' ? a.studentsHelpedCount - b.studentsHelpedCount : b.studentsHelpedCount - a.studentsHelpedCount));
      } else {
        list.sort((a, b) => (filters.sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating));
      }

      return list;
    }
  }

  async getMentorDetail(id: string): Promise<{ mentor: MentorProfile & { user: User }; reviews: any[]; studentsHelped: any[] }> {
    try {
      return await this.request<any>(`/mentors/detail/${id}`);
    } catch {
      const profile = dynamicMentorProfiles[id] || dynamicMentorProfiles['usr_mentor_nitin'];
      const user = dynamicUsers[id] || dynamicUsers['usr_mentor_nitin'];
      const reviews = dynamicReviews.filter(r => r.mentorId === id);
      const studentsHelped = [
        { name: 'Akshay Ramkishor Rahangdale', project: 'Guidely: E-learning & Collaborative Mentorship Platform', avatar: MOCK_USERS['usr_student_akshay'].avatarUrl },
        { name: 'Abhimanyu Kumar Sahu', project: 'AI-Powered Cyber Threat Intelligence Detector', avatar: MOCK_USERS['usr_student_abhimanyu'].avatarUrl },
        { name: 'Sapna Jaiswal', project: 'Automated Chest X-Ray Diagnosis with ViT', avatar: MOCK_USERS['usr_student_sapna'].avatarUrl }
      ];

      return {
        mentor: { ...profile, user },
        reviews,
        studentsHelped
      };
    }
  }

  async getMentorDashboard(): Promise<any> {
    try {
      return await this.request<any>('/mentors/dashboard');
    } catch {
      const uid = this.getCurrentMockUserId();
      const profile = dynamicMentorProfiles[uid] || dynamicMentorProfiles['usr_mentor_nitin'];
      const activeMentees = [
        {
          id: 'usr_student_akshay',
          fullName: 'Akshay Ramkishor Rahangdale',
          avatarUrl: MOCK_USERS['usr_student_akshay'].avatarUrl,
          college: 'SAGE University Bhopal',
          projectTitle: 'Guidely: E-learning & Collaborative Project Mentorship Platform',
          projectId: 'proj_guidely_pbl',
          progressPercentage: 68,
          lastActivity: '2 hours ago'
        },
        {
          id: 'usr_student_abhimanyu',
          fullName: 'Abhimanyu Kumar Sahu',
          avatarUrl: MOCK_USERS['usr_student_abhimanyu'].avatarUrl,
          college: 'SAGE University Bhopal',
          projectTitle: 'AI-Powered Cyber Threat Intelligence & Anomaly Detector',
          projectId: 'proj_threat_intel',
          progressPercentage: 45,
          lastActivity: 'Yesterday'
        }
      ];

      const upcomingSessions = dynamicSessions.filter(s => s.mentorId === uid && s.status === 'CONFIRMED');
      const pendingRequests = dynamicRequests.filter(r => r.mentorId === uid && r.status === 'PENDING');
      const recentReviews = dynamicReviews.filter(r => r.mentorId === uid);

      return {
        profile,
        activeMentees,
        upcomingSessions,
        pendingRequests,
        recentReviews,
        stats: {
          totalMentees: 45,
          activeProjects: 4,
          hoursMentored: 128,
          rating: profile.rating || 4.97
        }
      };
    }
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
    try {
      return await this.request<MentorshipRequest>('/mentorship/request', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      const uid = this.getCurrentMockUserId();
      const student = dynamicUsers[uid] || dynamicUsers['usr_student_akshay'];
      const mentor = dynamicUsers[data.mentorId] || dynamicUsers['usr_mentor_nitin'];

      const newReq: MentorshipRequest = {
        id: `req_${Date.now()}`,
        studentId: uid,
        mentorId: data.mentorId,
        projectTitle: data.projectTitle,
        projectDescription: data.projectDescription,
        currentKnowledge: data.currentKnowledge,
        techKnown: data.techKnown,
        helpNeeded: data.helpNeeded,
        expectedOutcome: data.expectedOutcome,
        preferredTimes: data.preferredTimes,
        additionalMessage: data.additionalMessage,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        student: {
          id: student.id,
          fullName: student.fullName,
          avatarUrl: student.avatarUrl,
          college: 'SAGE University Bhopal'
        },
        mentor: {
          id: mentor.id,
          fullName: mentor.fullName,
          avatarUrl: mentor.avatarUrl
        }
      };

      dynamicRequests.unshift(newReq);
      return newReq;
    }
  }

  async getStudentRequests(): Promise<MentorshipRequest[]> {
    try {
      return await this.request<MentorshipRequest[]>('/mentorship/student-requests');
    } catch {
      const uid = this.getCurrentMockUserId();
      return dynamicRequests.filter(r => r.studentId === uid || uid === 'usr_student_akshay');
    }
  }

  async getMentorRequests(): Promise<MentorshipRequest[]> {
    try {
      return await this.request<MentorshipRequest[]>('/mentorship/mentor-requests');
    } catch {
      const uid = this.getCurrentMockUserId();
      return dynamicRequests.filter(r => r.mentorId === uid || uid === 'usr_mentor_nitin');
    }
  }

  async respondToRequest(requestId: string, action: 'ACCEPT' | 'REJECT' | 'REQUEST_INFO', notes?: string): Promise<MentorshipRequest> {
    try {
      return await this.request<MentorshipRequest>(`/mentorship/request/${requestId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ action, notes })
      });
    } catch {
      const req = dynamicRequests.find(r => r.id === requestId);
      if (req) {
        req.status = action === 'ACCEPT' ? 'ACCEPTED' : action === 'REJECT' ? 'REJECTED' : 'INFO_REQUESTED';
        req.mentorNotes = notes;
        req.updatedAt = new Date().toISOString();
        return req;
      }
      throw new Error('Request not found');
    }
  }

  async provideAdditionalRequestInfo(requestId: string, additionalMessage: string): Promise<MentorshipRequest> {
    const req = dynamicRequests.find(r => r.id === requestId);
    if (req) {
      req.status = 'INFO_PROVIDED';
      req.additionalMessage = additionalMessage;
      req.updatedAt = new Date().toISOString();
      return req;
    }
    throw new Error('Request not found');
  }

  // --- Project Workspace ---
  async getMyProjects(): Promise<Project[]> {
    try {
      return await this.request<Project[]>('/projects/my-projects');
    } catch {
      const uid = this.getCurrentMockUserId();
      const studentProjects = Object.values(dynamicProjects).filter(p => p.studentId === uid);
      return studentProjects.length > 0 ? studentProjects : [dynamicProjects['proj_guidely_pbl']];
    }
  }

  async getProjectWorkspace(projectId: string): Promise<{
    project: Project;
    goals: ProjectGoal[];
    milestones: ProjectMilestone[];
    tasks: ProjectTask[];
    resources: ProjectResource[];
    notes: ProjectNote[];
  }> {
    try {
      return await this.request<any>(`/projects/${projectId}`);
    } catch {
      const project = dynamicProjects[projectId] || dynamicProjects['proj_guidely_pbl'];
      const workspace = dynamicWorkspaces[projectId] || dynamicWorkspaces['proj_guidely_pbl'];
      return {
        project,
        ...workspace
      };
    }
  }

  async updateProject(projectId: string, data: Partial<Project>): Promise<Project> {
    if (dynamicProjects[projectId]) {
      dynamicProjects[projectId] = { ...dynamicProjects[projectId], ...data, updatedAt: new Date().toISOString() };
      return dynamicProjects[projectId];
    }
    return dynamicProjects['proj_guidely_pbl'];
  }

  // Goals
  async addGoal(projectId: string, data: { title: string; description?: string; targetDate?: string }): Promise<ProjectGoal> {
    const ws = dynamicWorkspaces[projectId] || dynamicWorkspaces['proj_guidely_pbl'];
    const newGoal: ProjectGoal = {
      id: `goal_${Date.now()}`,
      projectId,
      title: data.title,
      description: data.description,
      isCompleted: false,
      targetDate: data.targetDate,
      orderIndex: ws.goals.length + 1,
      createdAt: new Date().toISOString()
    };
    ws.goals.push(newGoal);
    return newGoal;
  }

  async updateGoal(projectId: string, goalId: string, data: Partial<ProjectGoal>): Promise<ProjectGoal> {
    const ws = dynamicWorkspaces[projectId] || dynamicWorkspaces['proj_guidely_pbl'];
    const g = ws.goals.find(x => x.id === goalId);
    if (g) Object.assign(g, data);
    return g || ws.goals[0];
  }

  async deleteGoal(projectId: string, goalId: string): Promise<void> {
    const ws = dynamicWorkspaces[projectId] || dynamicWorkspaces['proj_guidely_pbl'];
    ws.goals = ws.goals.filter(x => x.id !== goalId);
  }

  // Milestones
  async addMilestone(projectId: string, data: { title: string; description?: string; dueDate?: string }): Promise<ProjectMilestone> {
    const ws = dynamicWorkspaces[projectId] || dynamicWorkspaces['proj_guidely_pbl'];
    const newMs: ProjectMilestone = {
      id: `ms_${Date.now()}`,
      projectId,
      title: data.title,
      description: data.description,
      status: 'PENDING',
      dueDate: data.dueDate,
      orderIndex: ws.milestones.length + 1,
      createdAt: new Date().toISOString()
    };
    ws.milestones.push(newMs);
    return newMs;
  }

  async updateMilestone(projectId: string, milestoneId: string, data: Partial<ProjectMilestone>): Promise<ProjectMilestone> {
    const ws = dynamicWorkspaces[projectId] || dynamicWorkspaces['proj_guidely_pbl'];
    const ms = ws.milestones.find(x => x.id === milestoneId);
    if (ms) Object.assign(ms, data);
    return ms || ws.milestones[0];
  }

  async deleteMilestone(projectId: string, milestoneId: string): Promise<void> {
    const ws = dynamicWorkspaces[projectId] || dynamicWorkspaces['proj_guidely_pbl'];
    ws.milestones = ws.milestones.filter(x => x.id !== milestoneId);
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
    const ws = dynamicWorkspaces[projectId] || dynamicWorkspaces['proj_guidely_pbl'];
    const newTask: ProjectTask = {
      id: `task_${Date.now()}`,
      projectId,
      milestoneId: data.milestoneId,
      title: data.title,
      description: data.description,
      assigneeRole: data.assigneeRole,
      status: 'TODO',
      priority: data.priority,
      dueDate: data.dueDate,
      orderIndex: ws.tasks.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    ws.tasks.push(newTask);
    this.recalculateProjectProgress(projectId);
    return newTask;
  }

  async updateTask(projectId: string, taskId: string, data: Partial<ProjectTask>): Promise<ProjectTask> {
    const ws = dynamicWorkspaces[projectId] || dynamicWorkspaces['proj_guidely_pbl'];
    const t = ws.tasks.find(x => x.id === taskId);
    if (t) {
      Object.assign(t, data, { updatedAt: new Date().toISOString() });
      this.recalculateProjectProgress(projectId);
      return t;
    }
    return ws.tasks[0];
  }

  async deleteTask(projectId: string, taskId: string): Promise<void> {
    const ws = dynamicWorkspaces[projectId] || dynamicWorkspaces['proj_guidely_pbl'];
    ws.tasks = ws.tasks.filter(x => x.id !== taskId);
    this.recalculateProjectProgress(projectId);
  }

  private recalculateProjectProgress(projectId: string) {
    const ws = dynamicWorkspaces[projectId] || dynamicWorkspaces['proj_guidely_pbl'];
    const proj = dynamicProjects[projectId] || dynamicProjects['proj_guidely_pbl'];
    if (ws.tasks.length > 0) {
      const done = ws.tasks.filter(t => t.status === 'DONE').length;
      proj.progressPercentage = Math.round((done / ws.tasks.length) * 100);
    }
  }

  // Resources
  async addResource(projectId: string, data: { title: string; url: string; type: any }): Promise<ProjectResource> {
    const ws = dynamicWorkspaces[projectId] || dynamicWorkspaces['proj_guidely_pbl'];
    const newRes: ProjectResource = {
      id: `res_${Date.now()}`,
      projectId,
      title: data.title,
      url: data.url,
      type: data.type,
      addedByRole: 'STUDENT',
      addedByName: 'Akshay Ramkishor Rahangdale',
      createdAt: new Date().toISOString()
    };
    ws.resources.push(newRes);
    return newRes;
  }

  async deleteResource(projectId: string, resourceId: string): Promise<void> {
    const ws = dynamicWorkspaces[projectId] || dynamicWorkspaces['proj_guidely_pbl'];
    ws.resources = ws.resources.filter(x => x.id !== resourceId);
  }

  // Notes
  async addNote(projectId: string, data: { title: string; content: string; isPrivateToMentor: boolean }): Promise<ProjectNote> {
    const ws = dynamicWorkspaces[projectId] || dynamicWorkspaces['proj_guidely_pbl'];
    const newNote: ProjectNote = {
      id: `note_${Date.now()}`,
      projectId,
      authorId: this.getCurrentMockUserId(),
      authorName: 'Prof. Nitin Choudhary',
      authorRole: 'MENTOR',
      title: data.title,
      content: data.content,
      isPrivateToMentor: data.isPrivateToMentor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    ws.notes.push(newNote);
    return newNote;
  }

  async updateNote(projectId: string, noteId: string, data: Partial<ProjectNote>): Promise<ProjectNote> {
    const ws = dynamicWorkspaces[projectId] || dynamicWorkspaces['proj_guidely_pbl'];
    const n = ws.notes.find(x => x.id === noteId);
    if (n) Object.assign(n, data, { updatedAt: new Date().toISOString() });
    return n || ws.notes[0];
  }

  async deleteNote(projectId: string, noteId: string): Promise<void> {
    const ws = dynamicWorkspaces[projectId] || dynamicWorkspaces['proj_guidely_pbl'];
    ws.notes = ws.notes.filter(x => x.id !== noteId);
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
    const uid = this.getCurrentMockUserId();
    const student = dynamicUsers[uid] || dynamicUsers['usr_student_akshay'];
    const mentor = dynamicUsers[data.mentorId] || dynamicUsers['usr_mentor_nitin'];

    const newSess: MentorshipSession = {
      id: `sess_${Date.now()}`,
      studentId: uid,
      mentorId: data.mentorId,
      projectId: data.projectId || 'proj_guidely_pbl',
      title: data.title,
      agenda: data.agenda,
      scheduledAt: data.scheduledAt,
      durationMinutes: data.durationMinutes || 45,
      status: 'CONFIRMED',
      meetingUrl: `https://meet.jit.si/guidely-session-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      student: { id: student.id, fullName: student.fullName, avatarUrl: student.avatarUrl, college: 'SAGE University Bhopal' },
      mentor: { id: mentor.id, fullName: mentor.fullName, avatarUrl: mentor.avatarUrl, title: 'Assistant Professor', company: 'School of Computer Technology' }
    };
    dynamicSessions.unshift(newSess);
    return newSess;
  }

  async getMySessions(): Promise<MentorshipSession[]> {
    try {
      return await this.request<MentorshipSession[]>('/sessions/my-sessions');
    } catch {
      const uid = this.getCurrentMockUserId();
      return dynamicSessions.filter(s => s.studentId === uid || s.mentorId === uid || uid === 'usr_student_akshay');
    }
  }

  async confirmSession(sessionId: string, meetingUrl?: string): Promise<MentorshipSession> {
    const s = dynamicSessions.find(x => x.id === sessionId);
    if (s) {
      s.status = 'CONFIRMED';
      if (meetingUrl) s.meetingUrl = meetingUrl;
      return s;
    }
    throw new Error('Session not found');
  }

  async rescheduleSession(sessionId: string, scheduledAt: string): Promise<MentorshipSession> {
    const s = dynamicSessions.find(x => x.id === sessionId);
    if (s) {
      s.status = 'RESCHEDULED';
      s.scheduledAt = scheduledAt;
      return s;
    }
    throw new Error('Session not found');
  }

  async cancelSession(sessionId: string, reason?: string): Promise<MentorshipSession> {
    const s = dynamicSessions.find(x => x.id === sessionId);
    if (s) {
      s.status = 'CANCELLED';
      s.sessionNotes = reason;
      return s;
    }
    throw new Error('Session not found');
  }

  async completeSession(sessionId: string, sessionNotes: string): Promise<MentorshipSession> {
    const s = dynamicSessions.find(x => x.id === sessionId);
    if (s) {
      s.status = 'COMPLETED';
      s.sessionNotes = sessionNotes;
      return s;
    }
    throw new Error('Session not found');
  }

  async submitSessionFeedback(sessionId: string, feedback: string, rating: number): Promise<MentorshipSession> {
    const s = dynamicSessions.find(x => x.id === sessionId);
    if (s) {
      s.studentFeedback = feedback;
      s.studentRating = rating;
      return s;
    }
    throw new Error('Session not found');
  }

  // --- Messaging ---
  async getConversations(): Promise<Conversation[]> {
    try {
      return await this.request<Conversation[]>('/messaging/conversations');
    } catch {
      return dynamicConversations;
    }
  }

  async getOrCreateConversation(studentId: string, mentorId: string): Promise<Conversation> {
    let conv = dynamicConversations.find(c => c.studentId === studentId && c.mentorId === mentorId);
    if (!conv) {
      conv = {
        id: `conv_${Date.now()}`,
        studentId,
        mentorId,
        unreadStudentCount: 0,
        unreadMentorCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        student: { id: studentId, fullName: dynamicUsers[studentId]?.fullName || 'Student', avatarUrl: dynamicUsers[studentId]?.avatarUrl },
        mentor: { id: mentorId, fullName: dynamicUsers[mentorId]?.fullName || 'Mentor', avatarUrl: dynamicUsers[mentorId]?.avatarUrl }
      };
      dynamicConversations.push(conv);
    }
    return conv;
  }

  async getMessages(conversationId: string): Promise<{ conversation: Conversation; messages: Message[] }> {
    try {
      return await this.request<any>(`/messaging/conversations/${conversationId}/messages`);
    } catch {
      const conv = dynamicConversations.find(c => c.id === conversationId) || dynamicConversations[0];
      const msgs = dynamicMessages[conversationId] || dynamicMessages['conv_akshay_nitin'] || [];
      return { conversation: conv, messages: msgs };
    }
  }

  async sendMessage(conversationId: string, data: { text: string; attachments?: any[] }): Promise<Message> {
    const uid = this.getCurrentMockUserId();
    const sender = dynamicUsers[uid] || dynamicUsers['usr_student_akshay'];

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: uid,
      senderRole: sender.role,
      senderName: sender.fullName,
      text: data.text,
      attachments: data.attachments,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    if (!dynamicMessages[conversationId]) {
      dynamicMessages[conversationId] = [];
    }
    dynamicMessages[conversationId].push(newMsg);

    const conv = dynamicConversations.find(c => c.id === conversationId);
    if (conv) {
      conv.lastMessageId = newMsg.id;
      conv.lastMessageText = newMsg.text;
      conv.lastMessageAt = newMsg.createdAt;
    }

    return newMsg;
  }

  async markConversationRead(conversationId: string): Promise<void> {
    const msgs = dynamicMessages[conversationId];
    if (msgs) {
      msgs.forEach(m => { m.isRead = true; });
    }
  }

  // --- Notifications ---
  async getNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
    try {
      return await this.request<any>('/notifications');
    } catch {
      const unreadCount = dynamicNotifications.filter(n => !n.isRead).length;
      return { notifications: dynamicNotifications, unreadCount };
    }
  }

  async markNotificationRead(id: string): Promise<void> {
    const n = dynamicNotifications.find(x => x.id === id);
    if (n) n.isRead = true;
  }

  async markAllNotificationsRead(): Promise<void> {
    dynamicNotifications.forEach(n => { n.isRead = true; });
  }

  // --- Reviews ---
  async getMentorReviews(mentorId: string): Promise<Review[]> {
    try {
      return await this.request<Review[]>(`/reviews/mentor/${mentorId}`);
    } catch {
      return dynamicReviews.filter(r => r.mentorId === mentorId);
    }
  }

  async submitReview(data: { mentorId: string; projectId?: string; rating: number; comment: string }): Promise<Review> {
    const uid = this.getCurrentMockUserId();
    const student = dynamicUsers[uid] || dynamicUsers['usr_student_akshay'];

    const newRev: Review = {
      id: `rev_${Date.now()}`,
      studentId: uid,
      mentorId: data.mentorId,
      projectId: data.projectId || 'proj_guidely_pbl',
      rating: data.rating,
      comment: data.comment,
      isVerifiedMentorship: true,
      isApproved: true,
      createdAt: new Date().toISOString(),
      student: { id: student.id, fullName: student.fullName, avatarUrl: student.avatarUrl, college: 'SAGE University Bhopal' }
    };
    dynamicReviews.unshift(newRev);
    return newRev;
  }

  // --- Admin ---
  async getAdminOverview(): Promise<AdminAnalytics> {
    try {
      return await this.request<AdminAnalytics>('/admin/overview');
    } catch {
      return MOCK_ADMIN_ANALYTICS;
    }
  }

  async getAdminUsers(filters: { search?: string; role?: string; status?: string; page?: number; limit?: number }): Promise<{ users: User[]; total: number; page: number; totalPages: number }> {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      return await this.request<any>(`/admin/users?${params.toString()}`);
    } catch {
      let list = Object.values(dynamicUsers);
      if (filters.role) list = list.filter(u => u.role === filters.role);
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(u => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
      }
      return {
        users: list,
        total: list.length,
        page: 1,
        totalPages: 1
      };
    }
  }

  async toggleUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<User> {
    const u = dynamicUsers[userId];
    if (u) {
      u.status = status;
      return u;
    }
    throw new Error('User not found');
  }

  async getPendingVerifications(): Promise<(MentorProfile & { user: User })[]> {
    try {
      return await this.request<any>('/admin/verifications');
    } catch {
      return [
        {
          ...dynamicMentorProfiles['usr_mentor_ananya'],
          verificationStatus: 'PENDING',
          user: dynamicUsers['usr_mentor_ananya']
        }
      ];
    }
  }

  async verifyMentor(userId: string, status: 'APPROVED' | 'REJECTED', notes?: string): Promise<MentorProfile> {
    const prof = dynamicMentorProfiles[userId];
    if (prof) {
      prof.isVerified = status === 'APPROVED';
      prof.verificationStatus = status;
      prof.verificationNotes = notes;
      return prof;
    }
    throw new Error('Mentor not found');
  }

  async getAdminReports(): Promise<Report[]> {
    try {
      return await this.request<Report[]>('/admin/reports');
    } catch {
      return dynamicReports;
    }
  }

  async createReport(data: { reportedUserId?: string; reportType: string; reason: string; details: string }): Promise<any> {
    const newRep: Report = {
      id: `rep_${Date.now()}`,
      reporterId: this.getCurrentMockUserId(),
      reportedUserId: data.reportedUserId,
      reportType: data.reportType as any,
      reason: data.reason,
      details: data.details,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dynamicReports.unshift(newRep);
    return newRep;
  }

  async resolveReport(reportId: string, status: 'RESOLVED' | 'DISMISSED', adminNotes?: string): Promise<Report> {
    const rep = dynamicReports.find(r => r.id === reportId);
    if (rep) {
      rep.status = status;
      rep.adminNotes = adminNotes;
      rep.updatedAt = new Date().toISOString();
      return rep;
    }
    throw new Error('Report not found');
  }

  async getReviewsForModeration(): Promise<Review[]> {
    return dynamicReviews;
  }

  async moderateReview(reviewId: string, isApproved: boolean): Promise<void> {
    const r = dynamicReviews.find(x => x.id === reviewId);
    if (r) r.isApproved = isApproved;
  }

  // --- Cloudinary Media & Upload ---
  async uploadProfilePhoto(
    file: File,
    onProgress?: (pct: number) => void
  ): Promise<{ url: string; secureUrl: string; publicId: string; user: User }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.getToken();
    const isMock = token?.startsWith('mock_token_');

    if (isMock) {
      if (onProgress) {
        for (let p = 15; p <= 100; p += 35) {
          onProgress(p);
        }
      }
      const previewUrl = URL.createObjectURL(file);
      const uid = this.getCurrentMockUserId();
      const mockPublicId = `guidely/profiles/profile_${uid}_${Date.now()}`;
      if (dynamicUsers[uid]) {
        dynamicUsers[uid].avatarUrl = previewUrl;
        dynamicUsers[uid].avatarPublicId = mockPublicId;
      }
      return {
        url: previewUrl,
        secureUrl: previewUrl,
        publicId: mockPublicId,
        user: dynamicUsers[uid] || ({
          id: uid,
          fullName: 'Demo User',
          email: 'user@guidely.dev',
          role: 'STUDENT',
          status: 'ACTIVE',
          avatarUrl: previewUrl,
          avatarPublicId: mockPublicId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as User)
      };
    }

    // Real server upload: Throw real errors on failure so the frontend never receives a fake success
    const res = await this.uploadWithProgress<any>('/upload/profile-photo', formData, onProgress);
    const uid = this.getCurrentMockUserId();
    if (dynamicUsers[uid]) {
      dynamicUsers[uid].avatarUrl = res.secureUrl || res.url;
      dynamicUsers[uid].avatarPublicId = res.publicId;
    }
    return res;
  }

  async deleteProfilePhoto(): Promise<{ user: User }> {
    const token = this.getToken();
    if (token?.startsWith('mock_token_')) {
      const uid = this.getCurrentMockUserId();
      if (dynamicUsers[uid]) {
        dynamicUsers[uid].avatarUrl = undefined;
        dynamicUsers[uid].avatarPublicId = undefined;
      }
      return { user: dynamicUsers[uid] };
    }

    const res = await this.request<any>('/upload/profile-photo', {
      method: 'DELETE'
    });
    const uid = this.getCurrentMockUserId();
    if (dynamicUsers[uid]) {
      dynamicUsers[uid].avatarUrl = undefined;
      dynamicUsers[uid].avatarPublicId = undefined;
    }
    return res;
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

    try {
      return await this.uploadWithProgress<CloudinaryUploadResult>('/upload/media', formData, onProgress);
    } catch {
      if (onProgress) {
        for (let p = 20; p <= 100; p += 40) {
          onProgress(p);
        }
      }
      const previewUrl = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');
      return {
        url: previewUrl,
        secureUrl: previewUrl,
        publicId: `guidely/${folder}/${Date.now()}`,
        resourceType: isVideo ? 'video' : file.type.startsWith('image/') ? 'image' : 'raw',
        format: file.name.split('.').pop() || 'bin',
        bytes: file.size,
        originalFilename: file.name,
        createdAt: new Date().toISOString()
      };
    }
  }

  async deleteMedia(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<{ success: boolean }> {
    try {
      return await this.request<any>('/upload/media', {
        method: 'DELETE',
        body: JSON.stringify({ publicId, resourceType })
      });
    } catch {
      return { success: true };
    }
  }

  async getUploadSignature(folder: string = 'guidely/general'): Promise<UploadSignatureResponse> {
    return await this.request<UploadSignatureResponse>('/upload/signature', {
      method: 'POST',
      body: JSON.stringify({ folder })
    });
  }

  async getUploadStatus(): Promise<{ isConfigured: boolean; cloudName: string; apiKeyPrefix: string }> {
    try {
      return await this.request<any>('/upload/status');
    } catch {
      return {
        isConfigured: true,
        cloudName: 'Guidely',
        apiKeyPrefix: '***5412'
      };
    }
  }
}

export const api = new ApiClient();
