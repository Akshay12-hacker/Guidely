// Review Service

import { apiClient } from '../api/client';
import { Review } from '../types';

export const reviewService = {
  async getMentorReviews(mentorId: string): Promise<Review[]> {
    return apiClient.get<Review[]>(`/reviews/mentor/${mentorId}`);
  },

  async submitReview(data: { mentorId: string; projectId?: string; rating: number; comment: string }): Promise<Review> {
    return apiClient.post<Review>('/reviews/submit', data);
  }
};
