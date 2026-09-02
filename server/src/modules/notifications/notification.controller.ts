import { Response, NextFunction } from 'express';
import { NotificationService } from './notification.service.js';
import { AuthenticatedRequest } from '../auth/auth.middleware.js';

export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  getMyNotifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.notificationService.getUserNotifications(req.user!.userId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  markAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await this.notificationService.markAsRead(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (err) {
      next(err);
    }
  };

  markAllAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await this.notificationService.markAllAsRead(req.user!.userId);
      res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
      next(err);
    }
  };

  deleteNotification = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await this.notificationService.deleteNotification(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (err) {
      next(err);
    }
  };
}
