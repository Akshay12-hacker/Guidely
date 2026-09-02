// Notification Service

import { apiClient } from '../api/client';
import { Notification } from '../types';

export const notificationService = {
  async getNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
    const res = await apiClient.get<any>('/notifications');
    if (Array.isArray(res)) {
      return {
        notifications: res,
        unreadCount: res.filter(n => !n.isRead).length
      };
    }
    return res;
  },

  async markRead(notificationId: string): Promise<void> {
    return apiClient.post<void>(`/notifications/${notificationId}/read`);
  },

  async markAllRead(): Promise<void> {
    return apiClient.post<void>('/notifications/read-all');
  }
};
