import { Router } from 'express';
import { NotificationController } from './notification.controller.js';
import { NotificationService } from './notification.service.js';
import { SqliteNotificationRepository } from './notification.repository.js';
import { authenticateToken } from '../auth/auth.middleware.js';

export function createNotificationRouter(): Router {
  const router = Router();
  const repo = new SqliteNotificationRepository();
  const service = new NotificationService(repo);
  const controller = new NotificationController(service);

  router.use(authenticateToken);

  router.get('/', controller.getMyNotifications);
  router.post('/:id/read', controller.markAsRead);
  router.post('/read-all', controller.markAllAsRead);
  router.delete('/:id', controller.deleteNotification);

  return router;
}
