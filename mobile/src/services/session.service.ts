// Session Service

import { apiClient } from '../api/client';
import { MentorshipSession } from '../types';

export const sessionService = {
  async getMySessions(): Promise<MentorshipSession[]> {
    return apiClient.get<MentorshipSession[]>('/sessions/my');
  },

  async requestSession(data: {
    mentorId: string;
    projectId?: string;
    title: string;
    agenda: string;
    scheduledAt: string;
    durationMinutes: number;
  }): Promise<MentorshipSession> {
    return apiClient.post<MentorshipSession>('/sessions/request', data);
  },

  async confirmSession(sessionId: string): Promise<MentorshipSession> {
    return apiClient.put<MentorshipSession>(`/sessions/${sessionId}/confirm`);
  },

  async rescheduleSession(sessionId: string, newScheduledAt: string): Promise<MentorshipSession> {
    return apiClient.put<MentorshipSession>(`/sessions/${sessionId}/reschedule`, { newScheduledAt });
  },

  async cancelSession(sessionId: string): Promise<MentorshipSession> {
    return apiClient.put<MentorshipSession>(`/sessions/${sessionId}/cancel`);
  },

  async completeSession(sessionId: string, sessionNotes: string): Promise<MentorshipSession> {
    return apiClient.put<MentorshipSession>(`/sessions/${sessionId}/complete`, { sessionNotes });
  },

  async submitFeedback(sessionId: string, studentFeedback: string, studentRating: number): Promise<MentorshipSession> {
    return apiClient.put<MentorshipSession>(`/sessions/${sessionId}/feedback`, {
      studentFeedback,
      studentRating
    });
  }
};
