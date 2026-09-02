import { MentorshipSessionModel, UserModel, StudentProfileModel, MentorProfileModel, ProjectModel } from '../../infrastructure/database/models/index.js';
import { MentorshipSession, SessionStatus } from '../../shared/types.js';

export interface ISessionRepository {
  findById(id: string): Promise<MentorshipSession | null>;
  findByStudentId(studentId: string): Promise<MentorshipSession[]>;
  findByMentorId(mentorId: string): Promise<MentorshipSession[]>;
  create(session: MentorshipSession): Promise<MentorshipSession>;
  updateStatus(id: string, status: SessionStatus, meetingUrl?: string, sessionNotes?: string): Promise<MentorshipSession | null>;
  reschedule(id: string, newScheduledAt: string): Promise<MentorshipSession | null>;
  addFeedback(id: string, feedback: string, rating: number): Promise<MentorshipSession | null>;
}

export class MongoSessionRepository implements ISessionRepository {
  async findById(id: string): Promise<MentorshipSession | null> {
    const doc = await MentorshipSessionModel.findById(id).lean();
    if (!doc) return null;
    return this.populateSession(doc);
  }

  async findByStudentId(studentId: string): Promise<MentorshipSession[]> {
    const docs = await MentorshipSessionModel.find({ studentId }).sort({ scheduledAt: -1 }).lean();
    return Promise.all(docs.map(doc => this.populateSession(doc)));
  }

  async findByMentorId(mentorId: string): Promise<MentorshipSession[]> {
    const docs = await MentorshipSessionModel.find({ mentorId }).sort({ scheduledAt: -1 }).lean();
    return Promise.all(docs.map(doc => this.populateSession(doc)));
  }

  async create(session: MentorshipSession): Promise<MentorshipSession> {
    const created = await MentorshipSessionModel.create({
      _id: session.id,
      studentId: session.studentId,
      mentorId: session.mentorId,
      projectId: session.projectId,
      title: session.title,
      agenda: session.agenda,
      scheduledAt: session.scheduledAt,
      durationMinutes: session.durationMinutes,
      status: session.status,
      meetingUrl: session.meetingUrl,
      sessionNotes: session.sessionNotes,
      studentFeedback: session.studentFeedback,
      studentRating: session.studentRating
    });

    return this.populateSession(created.toObject());
  }

  async updateStatus(
    id: string,
    status: SessionStatus,
    meetingUrl?: string,
    sessionNotes?: string
  ): Promise<MentorshipSession | null> {
    const update: any = { status };
    if (meetingUrl !== undefined) update.meetingUrl = meetingUrl;
    if (sessionNotes !== undefined) update.sessionNotes = sessionNotes;

    const updated = await MentorshipSessionModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!updated) return null;
    return this.populateSession(updated);
  }

  async reschedule(id: string, newScheduledAt: string): Promise<MentorshipSession | null> {
    const updated = await MentorshipSessionModel.findByIdAndUpdate(
      id,
      { scheduledAt: newScheduledAt, status: 'RESCHEDULED' },
      { new: true }
    ).lean();

    if (!updated) return null;
    return this.populateSession(updated);
  }

  async addFeedback(id: string, feedback: string, rating: number): Promise<MentorshipSession | null> {
    const updated = await MentorshipSessionModel.findByIdAndUpdate(
      id,
      { studentFeedback: feedback, studentRating: rating },
      { new: true }
    ).lean();

    if (!updated) return null;
    return this.populateSession(updated);
  }

  private async populateSession(doc: any): Promise<MentorshipSession> {
    const [studentUser, studentProf, mentorUser, mentorProf, project] = await Promise.all([
      UserModel.findById(doc.studentId).lean(),
      StudentProfileModel.findOne({ userId: doc.studentId }).lean(),
      UserModel.findById(doc.mentorId).lean(),
      MentorProfileModel.findOne({ userId: doc.mentorId }).lean(),
      doc.projectId ? ProjectModel.findById(doc.projectId).lean() : Promise.resolve(null)
    ]);

    return {
      id: doc._id || doc.id,
      studentId: doc.studentId,
      mentorId: doc.mentorId,
      projectId: doc.projectId || undefined,
      title: doc.title,
      agenda: doc.agenda,
      scheduledAt: doc.scheduledAt,
      durationMinutes: doc.durationMinutes,
      status: doc.status as SessionStatus,
      meetingUrl: doc.meetingUrl || undefined,
      sessionNotes: doc.sessionNotes || undefined,
      studentFeedback: doc.studentFeedback || undefined,
      studentRating: doc.studentRating || undefined,
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
      } : undefined,
      project: project ? {
        id: project._id,
        title: project.title
      } : undefined
    };
  }
}

export { MongoSessionRepository as SqliteSessionRepository };
