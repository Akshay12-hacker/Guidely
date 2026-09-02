import { Response, NextFunction } from 'express';
import { ProjectService } from './project.service.js';
import { AuthenticatedRequest } from '../auth/auth.middleware.js';
import { UserModel } from '../../infrastructure/database/models/index.js';

export class ProjectController {

  constructor(private projectService: ProjectService) {}

  getWorkspace = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const workspace = await this.projectService.getProjectWorkspace(
        req.params.id,
        req.user!.userId,
        req.user!.role
      );
      res.status(200).json({ success: true, data: workspace });
    } catch (err) {
      next(err);
    }
  };

  getMyProjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userId, role } = req.user!;
      const projects = role === 'STUDENT'
        ? await this.projectService.getStudentProjects(userId)
        : await this.projectService.getMentorProjects(userId);
      res.status(200).json({ success: true, data: projects });
    } catch (err) {
      next(err);
    }
  };

  updateProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const updated = await this.projectService.updateProject(
        req.params.id,
        req.user!.userId,
        req.body
      );
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  };

  // Goals
  addGoal = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const goal = await this.projectService.addGoal(req.params.id, req.user!.userId, req.body);
      res.status(201).json({ success: true, data: goal });
    } catch (err) {
      next(err);
    }
  };

  updateGoal = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const goal = await this.projectService.updateGoal(
        req.params.id,
        req.params.goalId,
        req.user!.userId,
        req.body
      );
      res.status(200).json({ success: true, data: goal });
    } catch (err) {
      next(err);
    }
  };

  deleteGoal = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await this.projectService.deleteGoal(req.params.id, req.params.goalId, req.user!.userId);
      res.status(200).json({ success: true, message: 'Goal deleted' });
    } catch (err) {
      next(err);
    }
  };

  // Milestones
  addMilestone = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const milestone = await this.projectService.addMilestone(req.params.id, req.user!.userId, req.body);
      res.status(201).json({ success: true, data: milestone });
    } catch (err) {
      next(err);
    }
  };

  updateMilestone = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const milestone = await this.projectService.updateMilestone(
        req.params.id,
        req.params.milestoneId,
        req.user!.userId,
        req.body
      );
      res.status(200).json({ success: true, data: milestone });
    } catch (err) {
      next(err);
    }
  };

  deleteMilestone = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await this.projectService.deleteMilestone(req.params.id, req.params.milestoneId, req.user!.userId);
      res.status(200).json({ success: true, message: 'Milestone deleted' });
    } catch (err) {
      next(err);
    }
  };

  // Tasks
  addTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const task = await this.projectService.addTask(req.params.id, req.user!.userId, req.body);
      res.status(201).json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  };

  updateTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const task = await this.projectService.updateTask(
        req.params.id,
        req.params.taskId,
        req.user!.userId,
        req.body
      );
      res.status(200).json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  };

  deleteTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await this.projectService.deleteTask(req.params.id, req.params.taskId, req.user!.userId);
      res.status(200).json({ success: true, message: 'Task deleted' });
    } catch (err) {
      next(err);
    }
  };

  // Resources
  addResource = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await UserModel.findById(req.user!.userId).lean();
      const resource = await this.projectService.addResource(
        req.params.id,
        req.user!.userId,
        req.user!.role,
        user?.fullName || 'User',
        req.body
      );
      res.status(201).json({ success: true, data: resource });
    } catch (err) {
      next(err);
    }
  };

  deleteResource = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await this.projectService.deleteResource(req.params.id, req.params.resourceId, req.user!.userId);
      res.status(200).json({ success: true, message: 'Resource removed' });
    } catch (err) {
      next(err);
    }
  };

  // Notes
  addNote = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await UserModel.findById(req.user!.userId).lean();
      const note = await this.projectService.addNote(
        req.params.id,
        req.user!.userId,
        req.user!.role,
        user?.fullName || 'User',
        req.body
      );
      res.status(201).json({ success: true, data: note });
    } catch (err) {
      next(err);
    }
  };

  updateNote = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const note = await this.projectService.updateNote(
        req.params.id,
        req.params.noteId,
        req.user!.userId,
        req.body
      );
      res.status(200).json({ success: true, data: note });
    } catch (err) {
      next(err);
    }
  };

  deleteNote = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await this.projectService.deleteNote(req.params.id, req.params.noteId, req.user!.userId);
      res.status(200).json({ success: true, message: 'Note removed' });
    } catch (err) {
      next(err);
    }
  };
}
