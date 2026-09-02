// Student Service

import { apiClient } from '../api/client';
import { StudentProfile } from '../types';

export const studentService = {
  async getProfile(): Promise<StudentProfile | null> {
    return apiClient.get<StudentProfile | null>('/students/profile');
  },

  async updateProfile(data: Partial<StudentProfile>): Promise<StudentProfile> {
    return apiClient.put<StudentProfile>('/students/profile', data);
  },

  async saveOnboardingStep(step: number, data: Partial<StudentProfile>): Promise<StudentProfile> {
    return apiClient.post<StudentProfile>('/students/onboarding/step', { step, data });
  },

  async getDashboardData(): Promise<{
    profile: StudentProfile | null;
    profileCompletionPercentage: number;
    activeProject: any;
    nextSession: any;
    pendingRequests: any[];
    recommendedMentors: any[];
  }> {
    return apiClient.get<any>('/students/dashboard');
  }
};
