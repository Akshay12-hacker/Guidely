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

  async getOnboardingOptions(): Promise<{ targetTechnologies: string[]; helpNeededAreas: string[]; skillCategories: string[] }> {
    return apiClient.get<{ targetTechnologies: string[]; helpNeededAreas: string[]; skillCategories: string[] }>('/students/onboarding-options');
  },

  async getAvailableSkills(query?: string, category?: string): Promise<{ skills: any[]; categories: string[]; total: number }> {
    const params: any = {};
    if (query) params.q = query;
    if (category && category !== 'All') params.category = category;
    return apiClient.get<{ skills: any[]; categories: string[]; total: number }>('/students/skills', { params });
  },

  async addCustomSkill(skill: string): Promise<{ profile: StudentProfile; addedSkill: string }> {
    return apiClient.post<{ profile: StudentProfile; addedSkill: string }>('/students/skills/custom', { skill });
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
