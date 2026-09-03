import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { SqliteAuthRepository } from './auth.repository.js';
import { authenticateToken } from './auth.middleware.js';
import { createAuthRateLimiter } from '../../shared/middleware/rateLimiter.middleware.js';

export function createAuthRouter(): Router {
  const router = Router();
  const authRepo = new SqliteAuthRepository();
  const authService = new AuthService(authRepo);
  const authController = new AuthController(authService);
  const authLimiter = createAuthRateLimiter();

  router.post('/register', authLimiter, authController.register);
  router.post('/login', authLimiter, authController.login);
  router.post('/google', authLimiter, authController.googleAuth);
  router.post('/forgot-password', authLimiter, authController.forgotPassword);
  router.post('/reset-password', authLimiter, authController.resetPassword);
  router.get('/me', authenticateToken, authController.getCurrentUser);
  router.post('/change-password', authenticateToken, authLimiter, authController.changePassword);

  return router;
}
