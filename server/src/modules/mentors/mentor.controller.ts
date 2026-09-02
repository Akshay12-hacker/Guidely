import { Request, Response, NextFunction } from 'express';
import { MentorService } from './mentor.service.js';
import { AuthenticatedRequest } from '../auth/auth.middleware.js';
import { MentorFilters } from '../../shared/types.js';

export class MentorController {
  constructor(private mentorService: MentorService) {}

  getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const profile = await this.mentorService.getProfile(req.user!.userId);
      res.status(200).json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const profile = await this.mentorService.updateProfile(req.user!.userId, req.body);
      res.status(200).json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  };

  saveOnboardingStep = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const step = parseInt(req.params.step, 10) || 1;
      const profile = await this.mentorService.saveOnboardingStep(req.user!.userId, step, req.body);
      res.status(200).json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  };

  discover = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters: MentorFilters = {
        search: req.query.search as string,
        minExperience: req.query.minExperience ? parseInt(req.query.minExperience as string, 10) : undefined,
        minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
        company: req.query.company as string,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
        technologies: req.query.technologies ? (req.query.technologies as string).split(',') : undefined,
        skills: req.query.skills ? (req.query.skills as string).split(',') : undefined
      };

      const mentors = await this.mentorService.discoverMentors(filters);
      res.status(200).json({ success: true, data: mentors });
    } catch (err) {
      next(err);
    }
  };

  getMentorDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const detail = await this.mentorService.getMentorDetail(id);
      res.status(200).json({ success: true, data: detail });
    } catch (err) {
      next(err);
    }
  };

  getDashboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = await this.mentorService.getMentorDashboardData(req.user!.userId);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };
}
