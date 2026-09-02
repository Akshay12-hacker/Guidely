import { MentorshipRequestModel, UserModel, StudentProfileModel, MentorProfileModel } from '../../infrastructure/database/models/index.js';
import { MentorshipRequest, MentorshipRequestStatus } from '../../shared/types.js';

export interface IMentorshipRepository {
  findById(id: string): Promise<MentorshipRequest | null>;
  findByStudentId(studentId: string): Promise<MentorshipRequest[]>;
  findByMentorId(mentorId: string): Promise<MentorshipRequest[]>;
  create(request: MentorshipRequest): Promise<MentorshipRequest>;
  updateStatus(id: string, status: MentorshipRequestStatus, notes?: string): Promise<MentorshipRequest | null>;
  updateStudentInfo(id: string, additionalMessage: string): Promise<MentorshipRequest | null>;
}

export class MongoMentorshipRepository implements IMentorshipRepository {
  async findById(id: string): Promise<MentorshipRequest | null> {
    const doc = await MentorshipRequestModel.findById(id).lean();
    if (!doc) return null;
    return this.populateRequest(doc);
  }

  async findByStudentId(studentId: string): Promise<MentorshipRequest[]> {
    const docs = await MentorshipRequestModel.find({ studentId }).sort({ createdAt: -1 }).lean();
    return Promise.all(docs.map(doc => this.populateRequest(doc)));
  }

  async findByMentorId(mentorId: string): Promise<MentorshipRequest[]> {
    const docs = await MentorshipRequestModel.find({ mentorId }).sort({ createdAt: -1 }).lean();
    return Promise.all(docs.map(doc => this.populateRequest(doc)));
  }

  async create(request: MentorshipRequest): Promise<MentorshipRequest> {
    const created = await MentorshipRequestModel.create({
      _id: request.id,
      studentId: request.studentId,
      mentorId: request.mentorId,
      projectTitle: request.projectTitle,
      projectDescription: request.projectDescription,
      currentKnowledge: request.currentKnowledge,
      techKnown: request.techKnown,
      helpNeeded: request.helpNeeded,
      expectedOutcome: request.expectedOutcome,
      preferredTimes: request.preferredTimes,
      additionalMessage: request.additionalMessage,
      status: request.status,
      mentorNotes: request.mentorNotes
    });

    return this.populateRequest(created.toObject());
  }

  async updateStatus(id: string, status: MentorshipRequestStatus, notes?: string): Promise<MentorshipRequest | null> {
    const update: any = { status };
    if (notes !== undefined) update.mentorNotes = notes;

    const updated = await MentorshipRequestModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!updated) return null;
    return this.populateRequest(updated);
  }

  async updateStudentInfo(id: string, additionalMessage: string): Promise<MentorshipRequest | null> {
    const updated = await MentorshipRequestModel.findByIdAndUpdate(
      id,
      { additionalMessage, status: 'INFO_PROVIDED' },
      { new: true }
    ).lean();

    if (!updated) return null;
    return this.populateRequest(updated);
  }

  private async populateRequest(doc: any): Promise<MentorshipRequest> {
    const [studentUser, studentProf, mentorUser, mentorProf] = await Promise.all([
      UserModel.findById(doc.studentId).lean(),
      StudentProfileModel.findOne({ userId: doc.studentId }).lean(),
      UserModel.findById(doc.mentorId).lean(),
      MentorProfileModel.findOne({ userId: doc.mentorId }).lean()
    ]);

    return {
      id: doc._id || doc.id,
      studentId: doc.studentId,
      mentorId: doc.mentorId,
      projectTitle: doc.projectTitle,
      projectDescription: doc.projectDescription,
      currentKnowledge: doc.currentKnowledge || '',
      techKnown: doc.techKnown || [],
      helpNeeded: doc.helpNeeded || [],
      expectedOutcome: doc.expectedOutcome || '',
      preferredTimes: doc.preferredTimes || '',
      additionalMessage: doc.additionalMessage || undefined,
      status: doc.status as MentorshipRequestStatus,
      mentorNotes: doc.mentorNotes || undefined,
      createdAt: doc.createdAt?.toISOString ? doc.createdAt.toISOString() : (doc.createdAt || new Date().toISOString()),
      updatedAt: doc.updatedAt?.toISOString ? doc.updatedAt.toISOString() : (doc.updatedAt || new Date().toISOString()),
      student: studentUser ? {
        id: studentUser._id,
        fullName: studentUser.fullName,
        avatarUrl: studentUser.avatarUrl,
        college: studentProf?.college,
        degree: studentProf?.degree
      } : undefined,
      mentor: mentorUser ? {
        id: mentorUser._id,
        fullName: mentorUser.fullName,
        avatarUrl: mentorUser.avatarUrl,
        title: mentorProf?.title,
        company: mentorProf?.company,
        rating: mentorProf?.rating
      } : undefined
    };
  }
}

export { MongoMentorshipRepository as SqliteMentorshipRepository };
