import { Request, Response, NextFunction } from 'express';
import { ReviewService } from './review.service.js';
import { AuthenticatedRequest } from '../auth/auth.middleware.js';
import { z } from 'zod';

const createReviewSchema = z.object({
  mentorId: z.string().min(1),
  projectId: z.string().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, 'Please provide a detailed review')
});

export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  getMentorReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { mentorId } = req.params;
      const reviews = await this.reviewService.getMentorReviews(mentorId);
      res.status(200).json({ success: true, data: reviews });
    } catch (err) {
      next(err);
    }
  };

  submitReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const validated = createReviewSchema.parse(req.body);
      const review = await this.reviewService.submitReview(req.user!.userId, validated);
      res.status(201).json({ success: true, data: review });
    } catch (err) {
      next(err);
    }
  };
}
