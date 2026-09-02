import { Router } from 'express';
import { ProjectController } from './project.controller.js';
import { ProjectService } from './project.service.js';
import { SqliteProjectRepository } from './project.repository.js';
import { authenticateToken } from '../auth/auth.middleware.js';

export function createProjectRouter(): Router {
  const router = Router();
  const repo = new SqliteProjectRepository();
  const service = new ProjectService(repo);
  const controller = new ProjectController(service);

  router.use(authenticateToken);

  router.get('/my-projects', controller.getMyProjects);
  router.get('/:id', controller.getWorkspace);
  router.put('/:id', controller.updateProject);

  // Goals
  router.post('/:id/goals', controller.addGoal);
  router.put('/:id/goals/:goalId', controller.updateGoal);
  router.delete('/:id/goals/:goalId', controller.deleteGoal);

  // Milestones
  router.post('/:id/milestones', controller.addMilestone);
  router.put('/:id/milestones/:milestoneId', controller.updateMilestone);
  router.delete('/:id/milestones/:milestoneId', controller.deleteMilestone);

  // Tasks
  router.post('/:id/tasks', controller.addTask);
  router.put('/:id/tasks/:taskId', controller.updateTask);
  router.delete('/:id/tasks/:taskId', controller.deleteTask);

  // Resources
  router.post('/:id/resources', controller.addResource);
  router.delete('/:id/resources/:resourceId', controller.deleteResource);

  // Notes
  router.post('/:id/notes', controller.addNote);
  router.put('/:id/notes/:noteId', controller.updateNote);
  router.delete('/:id/notes/:noteId', controller.deleteNote);

  return router;
}
