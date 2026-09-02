// Mentor Service

import { apiClient } from '../api/client';
import { MentorFilters, MentorProfile, User } from '../types';

export const mentorService = {
  async discoverMentors(filters: MentorFilters = {}): Promise<(MentorProfile & { user: User })[]> {
    return apiClient.get<(MentorProfile & { user: User })[]>('/mentors', { params: filters });
  },

  async getMentorDetail(mentorId: string): Promise<{
    mentor: MentorProfile & { user: User };
    reviews: any[];
    studentsHelped: any[];
  }> {
    return apiClient.get<any>(`/mentors/${mentorId}`);
  },

  async getProfile(): Promise<MentorProfile | null> {
    return apiClient.get<MentorProfile | null>('/mentors/profile/me');
  },

  async updateProfile(data: Partial<MentorProfile>): Promise<MentorProfile> {
    return apiClient.put<MentorProfile>('/mentors/profile', data);
  },

  async saveOnboardingStep(step: number, data: Partial<MentorProfile>): Promise<MentorProfile> {
    return apiClient.post<MentorProfile>('/mentors/onboarding/step', { step, data });
  },

  async getDashboardData(): Promise<{
    profile: MentorProfile | null;
    activeMenteesCount: number;
    completedMenteesCount: number;
    hoursMentored: number;
    averageRating: number;
    pendingRequests: any[];
    activeProjects: any[];
    upcomingSessions: any[];
  }> {
    return apiClient.get<any>('/mentors/dashboard/stats');
  }
};
