import { Request, Response, NextFunction } from 'express';
import { StudentService } from './student.service.js';
import { AuthenticatedRequest } from '../auth/auth.middleware.js';

export class StudentController {
  constructor(private studentService: StudentService) {}

  getSkills = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const q = req.query.q as string | undefined;
      const category = req.query.category as string | undefined;
      const data = await this.studentService.getAvailableSkills(q, category);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getOnboardingOptions = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = this.studentService.getOnboardingOptions();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  addCustomSkill = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { skill } = req.body;
      const result = await this.studentService.addCustomSkill(req.user!.userId, skill);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const profile = await this.studentService.getProfile(req.user!.userId);
      res.status(200).json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const profile = await this.studentService.updateProfile(req.user!.userId, req.body);
      res.status(200).json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  };

  saveOnboardingStep = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const step = parseInt(req.params.step, 10) || parseInt(req.body.step, 10) || 1;
      const stepData = req.body.data || req.body;
      const profile = await this.studentService.saveOnboardingStep(req.user!.userId, step, stepData);
      res.status(200).json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  };

  getDashboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = await this.studentService.getDashboardData(req.user!.userId);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };
}
