import { Response, NextFunction } from 'express';
import { MentorshipService } from './mentorship.service.js';
import { AuthenticatedRequest } from '../auth/auth.middleware.js';
import { z } from 'zod';

const createRequestSchema = z.object({
  mentorId: z.string().min(1),
  projectTitle: z.string().min(3),
  projectDescription: z.string().min(10),
  currentKnowledge: z.string().default(''),
  techKnown: z.array(z.string()).default([]),
  helpNeeded: z.array(z.string()).default([]),
  expectedOutcome: z.string().default(''),
  preferredTimes: z.string().default(''),
  additionalMessage: z.string().optional()
});

const respondSchema = z.object({
  action: z.enum(['ACCEPT', 'REJECT', 'REQUEST_INFO']),
  notes: z.string().optional()
});

const provideInfoSchema = z.object({
  additionalMessage: z.string().min(2)
});

export class MentorshipController {
  constructor(private mentorshipService: MentorshipService) {}

  createRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const validated = createRequestSchema.parse(req.body);
      const request = await this.mentorshipService.createRequest(req.user!.userId, validated);
      res.status(201).json({ success: true, data: request });
    } catch (err) {
      next(err);
    }
  };

  getStudentRequests = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const requests = await this.mentorshipService.getStudentRequests(req.user!.userId);
      res.status(200).json({ success: true, data: requests });
    } catch (err) {
      next(err);
    }
  };

  getMentorRequests = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const requests = await this.mentorshipService.getMentorRequests(req.user!.userId);
      res.status(200).json({ success: true, data: requests });
    } catch (err) {
      next(err);
    }
  };

  getRequestById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const request = await this.mentorshipService.getRequestById(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, data: request });
    } catch (err) {
      next(err);
    }
  };

  respondToRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const validated = respondSchema.parse(req.body);
      const request = await this.mentorshipService.respondToRequest(
        req.user!.userId,
        req.params.id,
        validated.action,
        validated.notes
      );
      res.status(200).json({ success: true, data: request });
    } catch (err) {
      next(err);
    }
  };

  provideAdditionalInfo = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const validated = provideInfoSchema.parse(req.body);
      const request = await this.mentorshipService.provideAdditionalInfo(
        req.user!.userId,
        req.params.id,
        validated.additionalMessage
      );
      res.status(200).json({ success: true, data: request });
    } catch (err) {
      next(err);
    }
  };
}
