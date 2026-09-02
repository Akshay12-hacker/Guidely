import { Router } from 'express';
import { MentorshipController } from './mentorship.controller.js';
import { MentorshipService } from './mentorship.service.js';
import { SqliteMentorshipRepository } from './mentorship.repository.js';
import { authenticateToken, requireStudent, requireMentor } from '../auth/auth.middleware.js';

export function createMentorshipRouter(): Router {
  const router = Router();
  const repo = new SqliteMentorshipRepository();
  const service = new MentorshipService(repo);
  const controller = new MentorshipController(service);

  router.use(authenticateToken);
  router.post('/request', requireStudent, controller.createRequest);
  router.get('/student-requests', requireStudent, controller.getStudentRequests);
  router.get('/mentor-requests', requireMentor, controller.getMentorRequests);
  router.get('/request/:id', controller.getRequestById);
  router.post('/request/:id/respond', requireMentor, controller.respondToRequest);
  router.post('/request/:id/info', requireStudent, controller.provideAdditionalInfo);

  return router;
}
