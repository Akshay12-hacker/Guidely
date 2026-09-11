// Project Workspace Service

import { apiClient } from '../api/client';
import {
  Project,
  ProjectGoal,
  ProjectMilestone,
  ProjectTask,
  ProjectResource,
  ProjectNote,
  ResourceType,
  TaskPriority,
  TaskStatus
} from '../types';

export const projectService = {
  async getMyProjects(): Promise<Project[]> {
    return apiClient.get<Project[]>('/projects/my-projects');
  },

  async getWorkspace(projectId: string): Promise<{
    project: Project;
    goals: ProjectGoal[];
    milestones: ProjectMilestone[];
    tasks: ProjectTask[];
    resources: ProjectResource[];
    notes: ProjectNote[];
  }> {
    return apiClient.get<any>(`/projects/${projectId}`);
  },

  async updateProject(projectId: string, data: Partial<Project>): Promise<Project> {
    return apiClient.put<Project>(`/projects/${projectId}`, data);
  },

  // Goals
  async addGoal(projectId: string, data: { title: string; description?: string; targetDate?: string }): Promise<ProjectGoal> {
    return apiClient.post<ProjectGoal>(`/projects/${projectId}/goals`, data);
  },
  async updateGoal(projectId: string, goalId: string, data: Partial<ProjectGoal>): Promise<ProjectGoal> {
    return apiClient.put<ProjectGoal>(`/projects/${projectId}/goals/${goalId}`, data);
  },
  async deleteGoal(projectId: string, goalId: string): Promise<void> {
    return apiClient.delete<void>(`/projects/${projectId}/goals/${goalId}`);
  },

  // Milestones
  async addMilestone(projectId: string, data: { title: string; description?: string; dueDate?: string }): Promise<ProjectMilestone> {
    return apiClient.post<ProjectMilestone>(`/projects/${projectId}/milestones`, data);
  },
  async updateMilestone(projectId: string, milestoneId: string, data: Partial<ProjectMilestone>): Promise<ProjectMilestone> {
    return apiClient.put<ProjectMilestone>(`/projects/${projectId}/milestones/${milestoneId}`, data);
  },
  async deleteMilestone(projectId: string, milestoneId: string): Promise<void> {
    return apiClient.delete<void>(`/projects/${projectId}/milestones/${milestoneId}`);
  },

  // Tasks
  async addTask(projectId: string, data: {
    title: string;
    description?: string;
    milestoneId?: string;
    assigneeRole: 'STUDENT' | 'MENTOR';
    priority: TaskPriority;
    dueDate?: string;
  }): Promise<ProjectTask> {
    return apiClient.post<ProjectTask>(`/projects/${projectId}/tasks`, data);
  },
  async updateTask(projectId: string, taskId: string, data: Partial<ProjectTask>): Promise<ProjectTask> {
    return apiClient.put<ProjectTask>(`/projects/${projectId}/tasks/${taskId}`, data);
  },
  async deleteTask(projectId: string, taskId: string): Promise<void> {
    return apiClient.delete<void>(`/projects/${projectId}/tasks/${taskId}`);
  },

  // Resources
  async addResource(projectId: string, data: { title: string; url: string; type: ResourceType }): Promise<ProjectResource> {
    return apiClient.post<ProjectResource>(`/projects/${projectId}/resources`, data);
  },
  async deleteResource(projectId: string, resourceId: string): Promise<void> {
    return apiClient.delete<void>(`/projects/${projectId}/resources/${resourceId}`);
  },

  // Notes
  async addNote(projectId: string, data: { title: string; content: string; isPrivateToMentor?: boolean }): Promise<ProjectNote> {
    return apiClient.post<ProjectNote>(`/projects/${projectId}/notes`, data);
  },
  async updateNote(projectId: string, noteId: string, data: Partial<ProjectNote>): Promise<ProjectNote> {
    return apiClient.put<ProjectNote>(`/projects/${projectId}/notes/${noteId}`, data);
  },
  async deleteNote(projectId: string, noteId: string): Promise<void> {
    return apiClient.delete<void>(`/projects/${projectId}/notes/${noteId}`);
  }
};
