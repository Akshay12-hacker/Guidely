import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { SqliteAuthRepository } from './auth.repository.js';
import { authenticateToken } from './auth.middleware.js';

export function createAuthRouter(): Router {
  const router = Router();
  const authRepo = new SqliteAuthRepository();
  const authService = new AuthService(authRepo);
  const authController = new AuthController(authService);

  router.post('/register', authController.register);
  router.post('/login', authController.login);
  router.post('/google', authController.googleAuth);
  router.post('/forgot-password', authController.forgotPassword);
  router.post('/reset-password', authController.resetPassword);
  router.get('/me', authenticateToken, authController.getCurrentUser);
  router.post('/change-password', authenticateToken, authController.changePassword);

  return router;
}
