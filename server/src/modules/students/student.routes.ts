import { Router } from 'express';
import { StudentController } from './student.controller.js';
import { StudentService } from './student.service.js';
import { SqliteStudentRepository } from './student.repository.js';
import { SqliteAuthRepository } from '../auth/auth.repository.js';
import { authenticateToken, requireStudent } from '../auth/auth.middleware.js';

export function createStudentRouter(): Router {
  const router = Router();
  const studentRepo = new SqliteStudentRepository();
  const authRepo = new SqliteAuthRepository();
  const studentService = new StudentService(studentRepo, authRepo);
  const studentController = new StudentController(studentService);

  // Public/unauthenticated skills directory & search endpoint
  router.get('/skills', studentController.getSkills);

  // Authenticated student routes
  router.use(authenticateToken);
  router.get('/profile', studentController.getProfile);
  router.put('/profile', studentController.updateProfile);
  router.post('/skills/custom', studentController.addCustomSkill);
  router.post('/onboarding/step/:step', studentController.saveOnboardingStep);
  router.post('/onboarding/step', studentController.saveOnboardingStep);
  router.get('/dashboard', requireStudent, studentController.getDashboard);

  return router;
}
