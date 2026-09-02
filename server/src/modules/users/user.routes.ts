import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authenticateToken } from '../auth/auth.middleware.js';

export function createUserRouter(): Router {
  const router = Router();
  const controller = new UserController();

  router.use(authenticateToken);
  router.put('/profile', controller.updateProfile);
  router.get('/:id', controller.getUserById);

  return router;
}
