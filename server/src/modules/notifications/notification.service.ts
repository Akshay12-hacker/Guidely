import { INotificationRepository } from './notification.repository.js';
import { Notification } from '../../shared/types.js';

export class NotificationService {
  constructor(private notificationRepo: INotificationRepository) {}

  async getUserNotifications(userId: string): Promise<{ notifications: Notification[]; unreadCount: number }> {
    const notifications = await this.notificationRepo.findByUserId(userId);
    const unreadCount = await this.notificationRepo.getUnreadCount(userId);
    return { notifications, unreadCount };
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.notificationRepo.markAsRead(id, userId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepo.markAllAsRead(userId);
  }

  async deleteNotification(id: string, userId: string): Promise<void> {
    await this.notificationRepo.delete(id, userId);
  }
}
