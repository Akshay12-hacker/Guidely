import { Response, NextFunction } from 'express';
import { StudentService } from './student.service.js';
import { AuthenticatedRequest } from '../auth/auth.middleware.js';

export class StudentController {
  constructor(private studentService: StudentService) {}

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
      const step = parseInt(req.params.step, 10) || 1;
      const profile = await this.studentService.saveOnboardingStep(req.user!.userId, step, req.body);
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
