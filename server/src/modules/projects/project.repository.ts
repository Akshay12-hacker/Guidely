import { ProjectModel, UserModel, StudentProfileModel, MentorProfileModel } from '../../infrastructure/database/models/index.js';
import {
  Project,
  ProjectGoal,
  ProjectMilestone,
  ProjectTask,
  ProjectResource,
  ProjectNote
} from '../../shared/types.js';

export interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  findByStudentId(studentId: string): Promise<Project[]>;
  findByMentorId(mentorId: string): Promise<Project[]>;
  getProjectWorkspace(projectId: string): Promise<{
    project: Project;
    goals: ProjectGoal[];
    milestones: ProjectMilestone[];
    tasks: ProjectTask[];
    resources: ProjectResource[];
    notes: ProjectNote[];
  } | null>;
  create(project: Project): Promise<Project>;
  update(id: string, data: Partial<Project>): Promise<Project | null>;
  // Goals
  addGoal(goal: ProjectGoal): Promise<ProjectGoal>;
  updateGoal(id: string, data: Partial<ProjectGoal>): Promise<ProjectGoal | null>;
  deleteGoal(id: string): Promise<boolean>;
  // Milestones
  addMilestone(milestone: ProjectMilestone): Promise<ProjectMilestone>;
  updateMilestone(id: string, data: Partial<ProjectMilestone>): Promise<ProjectMilestone | null>;
  deleteMilestone(id: string): Promise<boolean>;
  // Tasks
  addTask(task: ProjectTask): Promise<ProjectTask>;
  updateTask(id: string, data: Partial<ProjectTask>): Promise<ProjectTask | null>;
  deleteTask(id: string): Promise<boolean>;
  // Resources
  addResource(resource: ProjectResource): Promise<ProjectResource>;
  deleteResource(id: string): Promise<boolean>;
  // Notes
  addNote(note: ProjectNote): Promise<ProjectNote>;
  updateNote(id: string, data: Partial<ProjectNote>): Promise<ProjectNote | null>;
  deleteNote(id: string): Promise<boolean>;
  // Auto-progress
  recalculateProgress(projectId: string): Promise<number>;
}

export class MongoProjectRepository implements IProjectRepository {
  async findById(id: string): Promise<Project | null> {
    const doc = await ProjectModel.findById(id).lean();
    if (!doc) return null;
    return this.populateProject(doc);
  }

  async findByStudentId(studentId: string): Promise<Project[]> {
    const docs = await ProjectModel.find({ studentId }).sort({ updatedAt: -1 }).lean();
    return Promise.all(docs.map(doc => this.populateProject(doc)));
  }

  async findByMentorId(mentorId: string): Promise<Project[]> {
    const docs = await ProjectModel.find({ mentorId }).sort({ updatedAt: -1 }).lean();
    return Promise.all(docs.map(doc => this.populateProject(doc)));
  }

  async getProjectWorkspace(projectId: string) {
    const doc = await ProjectModel.findById(projectId).lean();
    if (!doc) return null;

    const project = await this.populateProject(doc);

    return {
      project,
      goals: (doc.goals || []).map((g: any) => ({
        id: g.id || g._id,
        projectId: g.projectId || projectId,
        title: g.title,
        description: g.description,
        isCompleted: Boolean(g.isCompleted),
        targetDate: g.targetDate,
        orderIndex: g.orderIndex || 0,
        createdAt: g.createdAt
      })),
      milestones: (doc.milestones || []).map((m: any) => ({
        id: m.id || m._id,
        projectId: m.projectId || projectId,
        title: m.title,
        description: m.description,
        status: m.status,
        dueDate: m.dueDate,
        completedAt: m.completedAt,
        orderIndex: m.orderIndex || 0,
        createdAt: m.createdAt
      })),
      tasks: (doc.tasks || []).map((t: any) => ({
        id: t.id || t._id,
        projectId: t.projectId || projectId,
        milestoneId: t.milestoneId,
        title: t.title,
        description: t.description,
        assigneeRole: t.assigneeRole,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        orderIndex: t.orderIndex || 0,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      })),
      resources: (doc.resources || []).map((r: any) => ({
        id: r.id || r._id,
        projectId: r.projectId || projectId,
        title: r.title,
        url: r.url,
        type: r.type,
        addedByRole: r.addedByRole,
        addedByName: r.addedByName,
        createdAt: r.createdAt
      })),
      notes: (doc.notes || []).map((n: any) => ({
        id: n.id || n._id,
        projectId: n.projectId || projectId,
        authorId: n.authorId,
        authorName: n.authorName,
        authorRole: n.authorRole,
        title: n.title,
        content: n.content,
        isPrivateToMentor: Boolean(n.isPrivateToMentor),
        createdAt: n.createdAt,
        updatedAt: n.updatedAt
      }))
    };
  }

  async create(project: Project): Promise<Project> {
    const created = await ProjectModel.create({
      _id: project.id,
      title: project.title,
      description: project.description,
      category: project.category,
      targetTechnologies: project.targetTechnologies,
      currentStage: project.currentStage,
      studentId: project.studentId,
      mentorId: project.mentorId,
      progressPercentage: project.progressPercentage,
      status: project.status,
      repositoryUrl: project.repositoryUrl,
      liveUrl: project.liveUrl,
      goals: [],
      milestones: [],
      tasks: [],
      resources: [],
      notes: []
    });

    return this.populateProject(created.toObject());
  }

  async update(id: string, data: Partial<Project>): Promise<Project | null> {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.targetTechnologies !== undefined) updateData.targetTechnologies = data.targetTechnologies;
    if (data.currentStage !== undefined) updateData.currentStage = data.currentStage;
    if (data.mentorId !== undefined) updateData.mentorId = data.mentorId;
    if (data.progressPercentage !== undefined) updateData.progressPercentage = data.progressPercentage;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.repositoryUrl !== undefined) updateData.repositoryUrl = data.repositoryUrl;
    if (data.liveUrl !== undefined) updateData.liveUrl = data.liveUrl;

    const updated = await ProjectModel.findByIdAndUpdate(id, updateData, { returnDocument: 'after' }).lean();
    if (!updated) return null;
    return this.populateProject(updated);
  }

  // --- Goals ---
  async addGoal(goal: ProjectGoal): Promise<ProjectGoal> {
    await ProjectModel.findByIdAndUpdate(goal.projectId, {
      $push: { goals: goal }
    });
    await this.recalculateProgress(goal.projectId);
    return goal;
  }

  async updateGoal(id: string, data: Partial<ProjectGoal>): Promise<ProjectGoal | null> {
    const project = await ProjectModel.findOne({ 'goals.id': id });
    if (!project) return null;

    const goal = project.goals.find((g: any) => g.id === id);
    if (!goal) return null;

    if (data.title !== undefined) goal.title = data.title;
    if (data.description !== undefined) goal.description = data.description;
    if (data.isCompleted !== undefined) goal.isCompleted = data.isCompleted;
    if (data.targetDate !== undefined) goal.targetDate = data.targetDate;

    await project.save();
    await this.recalculateProgress(project._id);

    return goal;
  }

  async deleteGoal(id: string): Promise<boolean> {
    const project = await ProjectModel.findOne({ 'goals.id': id });
    if (!project) return false;

    project.goals = project.goals.filter((g: any) => g.id !== id);
    await project.save();
    await this.recalculateProgress(project._id);
    return true;
  }

  // --- Milestones ---
  async addMilestone(milestone: ProjectMilestone): Promise<ProjectMilestone> {
    await ProjectModel.findByIdAndUpdate(milestone.projectId, {
      $push: { milestones: milestone }
    });
    await this.recalculateProgress(milestone.projectId);
    return milestone;
  }

  async updateMilestone(id: string, data: Partial<ProjectMilestone>): Promise<ProjectMilestone | null> {
    const project = await ProjectModel.findOne({ 'milestones.id': id });
    if (!project) return null;

    const milestone = project.milestones.find((m: any) => m.id === id);
    if (!milestone) return null;

    if (data.title !== undefined) milestone.title = data.title;
    if (data.description !== undefined) milestone.description = data.description;
    if (data.status !== undefined) {
      milestone.status = data.status;
      if (data.status === 'COMPLETED') {
        milestone.completedAt = new Date().toISOString();
      }
    }
    if (data.dueDate !== undefined) milestone.dueDate = data.dueDate;

    await project.save();
    await this.recalculateProgress(project._id);

    return milestone;
  }

  async deleteMilestone(id: string): Promise<boolean> {
    const project = await ProjectModel.findOne({ 'milestones.id': id });
    if (!project) return false;

    project.milestones = project.milestones.filter((m: any) => m.id !== id);
    await project.save();
    await this.recalculateProgress(project._id);
    return true;
  }

  // --- Tasks ---
  async addTask(task: ProjectTask): Promise<ProjectTask> {
    await ProjectModel.findByIdAndUpdate(task.projectId, {
      $push: { tasks: task }
    });
    await this.recalculateProgress(task.projectId);
    return task;
  }

  async updateTask(id: string, data: Partial<ProjectTask>): Promise<ProjectTask | null> {
    const project = await ProjectModel.findOne({ 'tasks.id': id });
    if (!project) return null;

    const task = project.tasks.find((t: any) => t.id === id);
    if (!task) return null;

    if (data.title !== undefined) task.title = data.title;
    if (data.description !== undefined) task.description = data.description;
    if (data.assigneeRole !== undefined) task.assigneeRole = data.assigneeRole;
    if (data.status !== undefined) task.status = data.status;
    if (data.priority !== undefined) task.priority = data.priority;
    if (data.dueDate !== undefined) task.dueDate = data.dueDate;
    if (data.milestoneId !== undefined) task.milestoneId = data.milestoneId;
    task.updatedAt = new Date().toISOString();

    await project.save();
    await this.recalculateProgress(project._id);

    return task;
  }

  async deleteTask(id: string): Promise<boolean> {
    const project = await ProjectModel.findOne({ 'tasks.id': id });
    if (!project) return false;

    project.tasks = project.tasks.filter((t: any) => t.id !== id);
    await project.save();
    await this.recalculateProgress(project._id);
    return true;
  }

  // --- Resources ---
  async addResource(resource: ProjectResource): Promise<ProjectResource> {
    await ProjectModel.findByIdAndUpdate(resource.projectId, {
      $push: { resources: resource }
    });
    return resource;
  }

  async deleteResource(id: string): Promise<boolean> {
    const project = await ProjectModel.findOne({ 'resources.id': id });
    if (!project) return false;

    project.resources = project.resources.filter((r: any) => r.id !== id);
    await project.save();
    return true;
  }

  // --- Notes ---
  async addNote(note: ProjectNote): Promise<ProjectNote> {
    await ProjectModel.findByIdAndUpdate(note.projectId, {
      $push: { notes: note }
    });
    return note;
  }

  async updateNote(id: string, data: Partial<ProjectNote>): Promise<ProjectNote | null> {
    const project = await ProjectModel.findOne({ 'notes.id': id });
    if (!project) return null;

    const note = project.notes.find((n: any) => n.id === id);
    if (!note) return null;

    if (data.title !== undefined) note.title = data.title;
    if (data.content !== undefined) note.content = data.content;
    if (data.isPrivateToMentor !== undefined) note.isPrivateToMentor = data.isPrivateToMentor;
    note.updatedAt = new Date().toISOString();

    await project.save();
    return note;
  }

  async deleteNote(id: string): Promise<boolean> {
    const project = await ProjectModel.findOne({ 'notes.id': id });
    if (!project) return false;

    project.notes = project.notes.filter((n: any) => n.id !== id);
    await project.save();
    return true;
  }

  // --- Progress calculation ---
  async recalculateProgress(projectId: string): Promise<number> {
    const project = await ProjectModel.findById(projectId);
    if (!project) return 0;

    const tasks = project.tasks || [];
    const milestones = project.milestones || [];

    let progress = 0;
    const totalItems = tasks.length + milestones.length;

    if (totalItems === 0) {
      progress = 10;
    } else {
      const completedTasks = tasks.filter((t: any) => t.status === 'DONE').length;
      const completedMilestones = milestones.filter((m: any) => m.status === 'COMPLETED').length;
      progress = Math.round(((completedTasks + completedMilestones) / totalItems) * 100);
    }

    project.progressPercentage = progress;
    project.status = progress === 100 ? 'COMPLETED' : 'IN_PROGRESS';
    await project.save();

    return progress;
  }

  private async populateProject(doc: any): Promise<Project> {
    const [studentUser, studentProf, mentorUser, mentorProf] = await Promise.all([
      UserModel.findById(doc.studentId).lean(),
      StudentProfileModel.findOne({ userId: doc.studentId }).lean(),
      doc.mentorId ? UserModel.findById(doc.mentorId).lean() : Promise.resolve(null),
      doc.mentorId ? MentorProfileModel.findOne({ userId: doc.mentorId }).lean() : Promise.resolve(null)
    ]);

    return {
      id: doc._id || doc.id,
      title: doc.title,
      description: doc.description,
      category: doc.category || 'General',
      targetTechnologies: doc.targetTechnologies || [],
      currentStage: doc.currentStage,
      studentId: doc.studentId,
      mentorId: doc.mentorId || undefined,
      progressPercentage: Number(doc.progressPercentage || 0),
      status: doc.status,
      repositoryUrl: doc.repositoryUrl || undefined,
      liveUrl: doc.liveUrl || undefined,
      createdAt: doc.createdAt?.toISOString ? doc.createdAt.toISOString() : (doc.createdAt || new Date().toISOString()),
      updatedAt: doc.updatedAt?.toISOString ? doc.updatedAt.toISOString() : (doc.updatedAt || new Date().toISOString()),
      student: studentUser ? {
        id: studentUser._id,
        fullName: studentUser.fullName,
        avatarUrl: studentUser.avatarUrl,
        college: studentProf?.college
      } : undefined,
      mentor: mentorUser ? {
        id: mentorUser._id,
        fullName: mentorUser.fullName,
        avatarUrl: mentorUser.avatarUrl,
        title: mentorProf?.title,
        company: mentorProf?.company
      } : undefined
    };
  }
}

export { MongoProjectRepository as SqliteProjectRepository };
