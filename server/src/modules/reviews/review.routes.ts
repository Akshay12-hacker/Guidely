import { Router } from 'express';
import { ReviewController } from './review.controller.js';
import { ReviewService } from './review.service.js';
import { SqliteReviewRepository } from './review.repository.js';
import { authenticateToken, requireStudent } from '../auth/auth.middleware.js';

export function createReviewRouter(): Router {
  const router = Router();
  const repo = new SqliteReviewRepository();
  const service = new ReviewService(repo);
  const controller = new ReviewController(service);

  router.get('/mentor/:mentorId', controller.getMentorReviews);
  router.post('/submit', authenticateToken, requireStudent, controller.submitReview);

  return router;
}
