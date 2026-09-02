import { Response, NextFunction } from 'express';
import { SessionService } from './session.service.js';
import { AuthenticatedRequest } from '../auth/auth.middleware.js';
import { z } from 'zod';

const requestSessionSchema = z.object({
  mentorId: z.string().min(1),
  projectId: z.string().optional(),
  title: z.string().min(3),
  agenda: z.string().min(5),
  scheduledAt: z.string().min(5),
  durationMinutes: z.number().optional()
});

const confirmSchema = z.object({
  meetingUrl: z.string().optional()
});

const rescheduleSchema = z.object({
  scheduledAt: z.string().min(5)
});

const completeSchema = z.object({
  sessionNotes: z.string().min(1)
});

const feedbackSchema = z.object({
  feedback: z.string().min(2),
  rating: z.number().min(1).max(5)
});

export class SessionController {
  constructor(private sessionService: SessionService) {}

  requestSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const validated = requestSessionSchema.parse(req.body);
      const session = await this.sessionService.requestSession(req.user!.userId, validated);
      res.status(201).json({ success: true, data: session });
    } catch (err) {
      next(err);
    }
  };

  getMySessions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userId, role } = req.user!;
      const sessions = role === 'STUDENT'
        ? await this.sessionService.getStudentSessions(userId)
        : await this.sessionService.getMentorSessions(userId);
      res.status(200).json({ success: true, data: sessions });
    } catch (err) {
      next(err);
    }
  };

  getSessionById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const session = await this.sessionService.getSessionById(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, data: session });
    } catch (err) {
      next(err);
    }
  };

  confirmSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const validated = confirmSchema.parse(req.body);
      const session = await this.sessionService.confirmSession(
        req.user!.userId,
        req.params.id,
        validated.meetingUrl
      );
      res.status(200).json({ success: true, data: session });
    } catch (err) {
      next(err);
    }
  };

  rescheduleSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const validated = rescheduleSchema.parse(req.body);
      const session = await this.sessionService.rescheduleSession(
        req.user!.userId,
        req.params.id,
        validated.scheduledAt
      );
      res.status(200).json({ success: true, data: session });
    } catch (err) {
      next(err);
    }
  };

  cancelSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const session = await this.sessionService.cancelSession(
        req.user!.userId,
        req.params.id,
        req.body.reason
      );
      res.status(200).json({ success: true, data: session });
    } catch (err) {
      next(err);
    }
  };

  completeSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const validated = completeSchema.parse(req.body);
      const session = await this.sessionService.completeSession(
        req.user!.userId,
        req.params.id,
        validated.sessionNotes
      );
      res.status(200).json({ success: true, data: session });
    } catch (err) {
      next(err);
    }
  };

  submitFeedback = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const validated = feedbackSchema.parse(req.body);
      const session = await this.sessionService.submitFeedback(
        req.user!.userId,
        req.params.id,
        validated.feedback,
        validated.rating
      );
      res.status(200).json({ success: true, data: session });
    } catch (err) {
      next(err);
    }
  };
}
