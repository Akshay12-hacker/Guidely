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
  router.get('/onboarding-options', mentorController.getOnboardingOptions);
  router.get('/discover', mentorController.discover);
  router.get('/', mentorController.discover);
  router.get('/detail/:id', mentorController.getMentorDetail);
  router.get('/profile/:id', mentorController.getMentorDetail);
  router.get('/:id', mentorController.getMentorDetail);

  // Authenticated mentor routes
  router.get('/profile', authenticateToken, mentorController.getProfile);
  router.get('/profile/me', authenticateToken, mentorController.getProfile);
  router.put('/profile', authenticateToken, mentorController.updateProfile);
  router.post('/onboarding/step/:step', authenticateToken, mentorController.saveOnboardingStep);
  router.post('/onboarding/step', authenticateToken, (req, res, next) => {
    req.params.step = req.body?.step || 1;
    req.body = req.body?.data || req.body;
    return mentorController.saveOnboardingStep(req, res, next);
  });
  router.get('/dashboard', authenticateToken, requireMentor, mentorController.getDashboard);
  router.get('/dashboard/stats', authenticateToken, requireMentor, mentorController.getDashboard);
  router.get('/students', authenticateToken, requireMentor, mentorController.getDashboard);

  return router;
}
