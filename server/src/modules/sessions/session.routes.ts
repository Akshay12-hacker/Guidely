import { Router } from 'express';
import { SessionController } from './session.controller.js';
import { SessionService } from './session.service.js';
import { SqliteSessionRepository } from './session.repository.js';
import { authenticateToken, requireStudent, requireMentor } from '../auth/auth.middleware.js';

export function createSessionRouter(): Router {
  const router = Router();
  const repo = new SqliteSessionRepository();
  const service = new SessionService(repo);
  const controller = new SessionController(service);

  router.use(authenticateToken);

  router.post('/request', requireStudent, controller.requestSession);
  router.get('/my-sessions', controller.getMySessions);
  router.get('/:id', controller.getSessionById);
  router.post('/:id/confirm', requireMentor, controller.confirmSession);
  router.post('/:id/reschedule', controller.rescheduleSession);
  router.post('/:id/cancel', controller.cancelSession);
  router.post('/:id/complete', requireMentor, controller.completeSession);
  router.post('/:id/feedback', requireStudent, controller.submitFeedback);

  return router;
}
