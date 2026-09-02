// Admin Service

import { apiClient } from '../api/client';
import { AdminAnalytics, MentorProfile, Report, Review, User } from '../types';

export const adminService = {
  async getOverview(): Promise<AdminAnalytics> {
    return apiClient.get<AdminAnalytics>('/admin/overview');
  },

  async getUsers(params: { search?: string; role?: string; status?: string; page?: number; limit?: number } = {}): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return apiClient.get<any>('/admin/users', { params });
  },

  async toggleUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<User> {
    return apiClient.put<User>(`/admin/users/${userId}/status`, { status });
  },

  async getPendingVerifications(): Promise<(MentorProfile & { user: User })[]> {
    return apiClient.get<(MentorProfile & { user: User })[]>('/admin/verifications');
  },

  async verifyMentor(userId: string, status: 'APPROVED' | 'REJECTED', notes?: string): Promise<MentorProfile> {
    return apiClient.post<MentorProfile>(`/admin/verifications/${userId}`, { status, notes });
  },

  async getReports(): Promise<Report[]> {
    return apiClient.get<Report[]>('/admin/reports');
  },

  async resolveReport(reportId: string, status: 'RESOLVED' | 'DISMISSED', adminNotes?: string): Promise<Report> {
    return apiClient.put<Report>(`/admin/reports/${reportId}/resolve`, { status, adminNotes });
  },

  async getReviewsForModeration(): Promise<Review[]> {
    return apiClient.get<Review[]>('/admin/reviews');
  },

  async moderateReview(reviewId: string, isApproved: boolean): Promise<void> {
    return apiClient.post<void>(`/admin/reviews/${reviewId}/moderate`, { isApproved });
  }
};
