import { Router } from 'express';
import { MentorController } from './mentor.controller.js';
import { MentorService } from './mentor.service.js';
import { SqliteMentorRepository } from './mentor.repository.js';
import { SqliteAuthRepository } from '../auth/auth.repository.js';
import { authenticateToken, requireMentor } from '../auth/auth.middleware.js';

export function createMentorRouter(): Router {
  const router = Router();
  const mentorRepo = new SqliteMentorRepository();
  const authRepo = new SqliteAuthRepository();
  const mentorService = new MentorService(mentorRepo, authRepo);
  const mentorController = new MentorController(mentorService);

  // Public discovery routes
  router.get('/discover', mentorController.discover);
  router.get('/detail/:id', mentorController.getMentorDetail);

  // Authenticated mentor routes
  router.get('/profile', authenticateToken, mentorController.getProfile);
  router.put('/profile', authenticateToken, mentorController.updateProfile);
  router.post('/onboarding/step/:step', authenticateToken, mentorController.saveOnboardingStep);
  router.get('/dashboard', authenticateToken, requireMentor, mentorController.getDashboard);

  return router;
}
