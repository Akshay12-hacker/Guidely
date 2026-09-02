import { NotificationModel } from '../../infrastructure/database/models/index.js';
import { Notification, NotificationType } from '../../shared/types.js';

export interface INotificationRepository {
  findByUserId(userId: string, limit?: number): Promise<Notification[]>;
  getUnreadCount(userId: string): Promise<number>;
  markAsRead(id: string, userId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  delete(id: string, userId: string): Promise<boolean>;
}

export class MongoNotificationRepository implements INotificationRepository {
  async findByUserId(userId: string, limit = 50): Promise<Notification[]> {
    const docs = await NotificationModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return docs.map(d => ({
      id: d._id,
      userId: d.userId,
      title: d.title,
      message: d.message,
      type: d.type as NotificationType,
      link: d.link || undefined,
      isRead: Boolean(d.isRead),
      createdAt: String(d.createdAt || new Date().toISOString())
    }));
  }

  async getUnreadCount(userId: string): Promise<number> {
    return NotificationModel.countDocuments({ userId, isRead: false });
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await NotificationModel.findOneAndUpdate({ _id: id, userId }, { $set: { isRead: true } });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await NotificationModel.updateMany({ userId }, { $set: { isRead: true } });
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const res = await NotificationModel.deleteOne({ _id: id, userId });
    return (res.deletedCount || 0) > 0;
  }
}

export { MongoNotificationRepository as SqliteNotificationRepository };
