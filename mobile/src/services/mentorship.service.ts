// Mentorship Request Service

import { apiClient } from '../api/client';
import { MentorshipRequest } from '../types';

export const mentorshipService = {
  async createRequest(data: {
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
    return apiClient.post<MentorshipRequest>('/mentorship/requests', data);
  },

  async getStudentRequests(): Promise<MentorshipRequest[]> {
    return apiClient.get<MentorshipRequest[]>('/mentorship/requests/student');
  },

  async getMentorRequests(): Promise<MentorshipRequest[]> {
    return apiClient.get<MentorshipRequest[]>('/mentorship/requests/mentor');
  },

  async respondToRequest(
    requestId: string,
    action: 'ACCEPT' | 'REJECT' | 'REQUEST_INFO',
    notes?: string
  ): Promise<MentorshipRequest> {
    return apiClient.put<MentorshipRequest>(`/mentorship/requests/${requestId}/respond`, {
      action,
      notes
    });
  },

  async provideAdditionalInfo(requestId: string, additionalMessage: string): Promise<MentorshipRequest> {
    return apiClient.put<MentorshipRequest>(`/mentorship/requests/${requestId}/provide-info`, {
      additionalMessage
    });
  }
};
