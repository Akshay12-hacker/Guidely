import crypto from 'crypto';
import { IProjectRepository } from './project.repository.js';
import { WebSocketManager } from '../../infrastructure/websocket/wsServer.js';
import { AppError } from '../../shared/errors/AppError.js';
import {
  Project,
  ProjectGoal,
  ProjectMilestone,
  ProjectTask,
  ProjectResource,
  ProjectNote,
  UserRole
} from '../../shared/types.js';

export class ProjectService {
  private ws = WebSocketManager.getInstance();

  constructor(private projectRepo: IProjectRepository) {}

  async getProjectWorkspace(projectId: string, userId: string, userRole: UserRole) {
    const workspace = await this.projectRepo.getProjectWorkspace(projectId);
    if (!workspace) {
      throw AppError.notFound('Project workspace not found');
    }

    const { project } = workspace;
    const isStudent = project.studentId === userId;
    const isMentor = project.mentorId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isStudent && !isMentor && !isAdmin) {
      throw AppError.forbidden('You are not a member of this project');
    }

    // Filter notes: students do not see mentor's private notes
    const filteredNotes = isStudent
      ? workspace.notes.filter(n => !n.isPrivateToMentor)
      : workspace.notes;

    return {
      ...workspace,
      notes: filteredNotes
    };
  }

  async getStudentProjects(studentId: string): Promise<Project[]> {
    return this.projectRepo.findByStudentId(studentId);
  }

  async getMentorProjects(mentorId: string): Promise<Project[]> {
    return this.projectRepo.findByMentorId(mentorId);
  }

  async updateProject(
    projectId: string,
    userId: string,
    data: Partial<Project>
  ): Promise<Project> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw AppError.notFound('Project not found');
    if (project.studentId !== userId && project.mentorId !== userId) {
      throw AppError.forbidden('Unauthorized');
    }

    const updated = await this.projectRepo.update(projectId, data);
    return updated!;
  }

  // Goals
  async addGoal(projectId: string, userId: string, data: { title: string; description?: string; targetDate?: string }): Promise<ProjectGoal> {
    await this.verifyMember(projectId, userId);
    const goal: ProjectGoal = {
      id: 'goal_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16),
      projectId,
      title: data.title,
      description: data.description,
      isCompleted: false,
      targetDate: data.targetDate,
      orderIndex: 0,
      createdAt: new Date().toISOString()
    };
    return this.projectRepo.addGoal(goal);
  }

  async updateGoal(projectId: string, goalId: string, userId: string, data: Partial<ProjectGoal>): Promise<ProjectGoal> {
    await this.verifyMember(projectId, userId);
    const updated = await this.projectRepo.updateGoal(goalId, data);
    if (!updated) throw AppError.notFound('Goal not found');
    return updated;
  }

  async deleteGoal(projectId: string, goalId: string, userId: string): Promise<void> {
    await this.verifyMember(projectId, userId);
    await this.projectRepo.deleteGoal(goalId);
  }

  // Milestones
  async addMilestone(projectId: string, userId: string, data: { title: string; description?: string; dueDate?: string }): Promise<ProjectMilestone> {
    await this.verifyMember(projectId, userId);
    const milestone: ProjectMilestone = {
      id: 'mile_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16),
      projectId,
      title: data.title,
      description: data.description,
      status: 'PENDING',
      dueDate: data.dueDate,
      orderIndex: 0,
      createdAt: new Date().toISOString()
    };
    return this.projectRepo.addMilestone(milestone);
  }

  async updateMilestone(projectId: string, milestoneId: string, userId: string, data: Partial<ProjectMilestone>): Promise<ProjectMilestone> {
    const project = await this.verifyMember(projectId, userId);
    const updated = await this.projectRepo.updateMilestone(milestoneId, data);
    if (!updated) throw AppError.notFound('Milestone not found');

    if (data.status === 'COMPLETED') {
      const recipientId = project.studentId === userId ? project.mentorId : project.studentId;
      if (recipientId) {
        this.ws.sendToUser(recipientId, {
          type: 'PROJECT_UPDATE',
          payload: { projectId, message: `Milestone "${updated.title}" marked as completed!` }
        });
      }
    }

    return updated;
  }

  async deleteMilestone(projectId: string, milestoneId: string, userId: string): Promise<void> {
    await this.verifyMember(projectId, userId);
    await this.projectRepo.deleteMilestone(milestoneId);
  }

  // Tasks
  async addTask(projectId: string, userId: string, data: {
    title: string;
    description?: string;
    milestoneId?: string;
    assigneeRole: 'STUDENT' | 'MENTOR';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    dueDate?: string;
  }): Promise<ProjectTask> {
    await this.verifyMember(projectId, userId);
    const task: ProjectTask = {
      id: 'task_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16),
      projectId,
      milestoneId: data.milestoneId,
      title: data.title,
      description: data.description,
      assigneeRole: data.assigneeRole,
      status: 'TODO',
      priority: data.priority,
      dueDate: data.dueDate,
      orderIndex: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return this.projectRepo.addTask(task);
  }

  async updateTask(projectId: string, taskId: string, userId: string, data: Partial<ProjectTask>): Promise<ProjectTask> {
    await this.verifyMember(projectId, userId);
    const updated = await this.projectRepo.updateTask(taskId, data);
    if (!updated) throw AppError.notFound('Task not found');
    return updated;
  }

  async deleteTask(projectId: string, taskId: string, userId: string): Promise<void> {
    await this.verifyMember(projectId, userId);
    await this.projectRepo.deleteTask(taskId);
  }

  // Resources
  async addResource(projectId: string, userId: string, userRole: UserRole, userName: string, data: {
    title: string;
    url: string;
    type: any;
  }): Promise<ProjectResource> {
    await this.verifyMember(projectId, userId);
    const resource: ProjectResource = {
      id: 'res_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16),
      projectId,
      title: data.title,
      url: data.url,
      type: data.type,
      addedByRole: userRole,
      addedByName: userName,
      createdAt: new Date().toISOString()
    };
    return this.projectRepo.addResource(resource);
  }

  async deleteResource(projectId: string, resourceId: string, userId: string): Promise<void> {
    await this.verifyMember(projectId, userId);
    await this.projectRepo.deleteResource(resourceId);
  }

  // Notes
  async addNote(projectId: string, userId: string, userRole: UserRole, userName: string, data: {
    title: string;
    content: string;
    isPrivateToMentor: boolean;
  }): Promise<ProjectNote> {
    await this.verifyMember(projectId, userId);
    const note: ProjectNote = {
      id: 'note_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16),
      projectId,
      authorId: userId,
      authorName: userName,
      authorRole: userRole,
      title: data.title,
      content: data.content,
      isPrivateToMentor: userRole === 'MENTOR' ? data.isPrivateToMentor : false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return this.projectRepo.addNote(note);
  }

  async updateNote(projectId: string, noteId: string, userId: string, data: Partial<ProjectNote>): Promise<ProjectNote> {
    await this.verifyMember(projectId, userId);
    const updated = await this.projectRepo.updateNote(noteId, data);
    if (!updated) throw AppError.notFound('Note not found');
    return updated;
  }

  async deleteNote(projectId: string, noteId: string, userId: string): Promise<void> {
    await this.verifyMember(projectId, userId);
    await this.projectRepo.deleteNote(noteId);
  }

  private async verifyMember(projectId: string, userId: string): Promise<Project> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw AppError.notFound('Project not found');
    if (project.studentId !== userId && project.mentorId !== userId) {
      throw AppError.forbidden('You are not authorized to perform actions on this project');
    }
    return project;
  }
}
