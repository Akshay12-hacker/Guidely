import { ReviewModel, MentorProfileModel, UserModel, ProjectModel, StudentProfileModel } from '../../infrastructure/database/models/index.js';
import { Review } from '../../shared/types.js';

export interface IReviewRepository {
  findByMentorId(mentorId: string): Promise<Review[]>;
  create(review: Review): Promise<Review>;
  hasReviewed(studentId: string, mentorId: string, projectId?: string): Promise<boolean>;
  updateMentorAggregateRating(mentorId: string): Promise<{ rating: number; count: number }>;
}

export class MongoReviewRepository implements IReviewRepository {
  async findByMentorId(mentorId: string): Promise<Review[]> {
    const docs = await ReviewModel.find({ mentorId, isApproved: true })
      .sort({ createdAt: -1 })
      .lean();

    const studentIds = docs.map(d => d.studentId);
    const projectIds: string[] = docs.map(d => d.projectId).filter((id): id is string => Boolean(id));
    const [studentUsers, studentProfs, projects] = await Promise.all([
      UserModel.find({ _id: { $in: studentIds } }).lean(),
      StudentProfileModel.find({ userId: { $in: studentIds } }).lean(),
      ProjectModel.find({ _id: { $in: projectIds } }).lean()
    ]);

    const userMap = new Map(studentUsers.map(u => [u._id, u]));
    const profMap = new Map(studentProfs.map(sp => [sp.userId, sp]));
    const projMap = new Map(projects.map(p => [p._id, p]));

    return docs.map(d => {
      const u = userMap.get(d.studentId);
      const sp = profMap.get(d.studentId);
      const p = d.projectId ? projMap.get(d.projectId) : null;

      return {
        id: d._id,
        studentId: d.studentId,
        mentorId: d.mentorId,
        projectId: d.projectId || undefined,
        rating: d.rating,
        comment: d.comment,
        isVerifiedMentorship: Boolean(d.isVerifiedMentorship),
        isApproved: Boolean(d.isApproved),
        createdAt: String(d.createdAt || new Date().toISOString()),
        student: u ? {
          id: u._id,
          fullName: u.fullName,
          avatarUrl: u.avatarUrl,
          college: sp?.college
        } : undefined,
        project: p ? {
          id: p._id,
          title: p.title
        } : undefined
      };
    });
  }

  async hasReviewed(studentId: string, mentorId: string, projectId?: string): Promise<boolean> {
    const query: any = { studentId, mentorId };
    if (projectId) query.projectId = projectId;

    const count = await ReviewModel.countDocuments(query);
    return count > 0;
  }

  async create(review: Review): Promise<Review> {
    const created = await ReviewModel.create({
      _id: review.id,
      studentId: review.studentId,
      mentorId: review.mentorId,
      projectId: review.projectId,
      rating: review.rating,
      comment: review.comment,
      isVerifiedMentorship: review.isVerifiedMentorship,
      isApproved: review.isApproved
    });

    await this.updateMentorAggregateRating(review.mentorId);
    return review;
  }

  async updateMentorAggregateRating(mentorId: string): Promise<{ rating: number; count: number }> {
    const reviews = await ReviewModel.find({ mentorId, isApproved: true }).lean();
    const count = reviews.length;

    let avgRating = 5.0;
    if (count > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      avgRating = parseFloat((sum / count).toFixed(1));
    }

    await MentorProfileModel.findOneAndUpdate(
      { userId: mentorId },
      { $set: { rating: avgRating, reviewsCount: count } }
    );

    return { rating: avgRating, count };
  }
}

export { MongoReviewRepository as SqliteReviewRepository };
