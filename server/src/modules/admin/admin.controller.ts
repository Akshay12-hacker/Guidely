import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service.js';
import { AuthenticatedRequest } from '../auth/auth.middleware.js';
import { z } from 'zod';

const verifySchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  notes: z.string().optional()
});

const reportSchema = z.object({
  reportedUserId: z.string().optional(),
  reportType: z.enum(['USER', 'CONTENT', 'MENTORSHIP_ISSUE', 'SPAM']),
  reason: z.string().min(3),
  details: z.string().min(5)
});

const resolveReportSchema = z.object({
  status: z.enum(['RESOLVED', 'DISMISSED']),
  adminNotes: z.string().optional()
});

export class AdminController {
  constructor(private adminService: AdminService) {}

  getOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const analytics = await this.adminService.getOverview();
      res.status(200).json({ success: true, data: analytics });
    } catch (err) {
      next(err);
    }
  };

  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = {
        search: req.query.search as string,
        role: req.query.role as string,
        status: req.query.status as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20
      };
      const result = await this.adminService.getUsers(filters);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  toggleUserStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = await this.adminService.toggleUserStatus(id, status);
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  };

  getPendingVerifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pending = await this.adminService.getPendingVerifications();
      res.status(200).json({ success: true, data: pending });
    } catch (err) {
      next(err);
    }
  };

  verifyMentor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validated = verifySchema.parse(req.body);
      const profile = await this.adminService.verifyMentor(id, validated.status, validated.notes);
      res.status(200).json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  };

  getReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reports = await this.adminService.getReports();
      res.status(200).json({ success: true, data: reports });
    } catch (err) {
      next(err);
    }
  };

  createReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const validated = reportSchema.parse(req.body);
      const report = await this.adminService.createReport(req.user!.userId, validated);
      res.status(201).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  };

  resolveReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validated = resolveReportSchema.parse(req.body);
      const report = await this.adminService.resolveReport(id, validated.status, validated.adminNotes);
      res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  };

  getReviewsForModeration = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reviews = await this.adminService.getReviewsForModeration();
      res.status(200).json({ success: true, data: reviews });
    } catch (err) {
      next(err);
    }
  };

  moderateReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { isApproved } = req.body;
      await this.adminService.moderateReview(id, Boolean(isApproved));
      res.status(200).json({ success: true, message: 'Review moderation updated' });
    } catch (err) {
      next(err);
    }
  };

  getProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projects = await this.adminService.getProjects();
      res.status(200).json({ success: true, data: projects });
    } catch (err) {
      next(err);
    }
  };
}
