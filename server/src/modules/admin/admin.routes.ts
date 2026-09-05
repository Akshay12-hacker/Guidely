import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { SqliteAdminRepository } from './admin.repository.js';
import { authenticateToken, requireAdmin } from '../auth/auth.middleware.js';

export function createAdminRouter(): Router {
  const router = Router();
  const repo = new SqliteAdminRepository();
  const service = new AdminService(repo);
  const controller = new AdminController(service);

  router.use(authenticateToken);

  // General users can submit a report
  router.post('/reports/create', controller.createReport);

  // Admin exclusive routes
  router.get('/overview', requireAdmin, controller.getOverview);
  router.get('/users', requireAdmin, controller.getUsers);
  router.put('/users/:id/status', requireAdmin, controller.toggleUserStatus);
  router.get('/verifications', requireAdmin, controller.getPendingVerifications);
  router.post('/verifications/:id', requireAdmin, controller.verifyMentor);
  router.get('/reports', requireAdmin, controller.getReports);
  router.put('/reports/:id/resolve', requireAdmin, controller.resolveReport);
  router.get('/reviews', requireAdmin, controller.getReviewsForModeration);
  router.put('/reviews/:id/moderate', requireAdmin, controller.moderateReview);
  router.get('/projects', requireAdmin, controller.getProjects);

  return router;
}
