import { Router } from 'express';
import { MessagingController } from './messaging.controller.js';
import { MessagingService } from './messaging.service.js';
import { SqliteMessagingRepository } from './messaging.repository.js';
import { authenticateToken } from '../auth/auth.middleware.js';

export function createMessagingRouter(): Router {
  const router = Router();
  const repo = new SqliteMessagingRepository();
  const service = new MessagingService(repo);
  const controller = new MessagingController(service);

  router.use(authenticateToken);

  router.get('/conversations', controller.getConversations);
  router.post('/conversations/get-or-create', controller.getOrCreateConversation);
  router.get('/conversations/:conversationId/messages', controller.getMessages);
  router.post('/conversations/:conversationId/messages', controller.sendMessage);
  router.post('/conversations/:conversationId/read', controller.markAsRead);

  return router;
}
