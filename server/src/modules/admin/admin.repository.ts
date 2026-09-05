import {
  UserModel,
  ProjectModel,
  MentorshipSessionModel,
  MentorshipRequestModel,
  MentorProfileModel,
  ReportModel,
  ReviewModel
} from '../../infrastructure/database/models/index.js';
import { User, AdminAnalytics, Report, Review, MentorProfile } from '../../shared/types.js';

const toIso = (d: any): string => {
  if (!d) return new Date().toISOString();
  if (typeof d === 'string') return d;
  if (d instanceof Date) return d.toISOString();
  return String(d);
};

export interface IAdminRepository {
  getAnalytics(): Promise<AdminAnalytics>;
  getUsers(filters: { search?: string; role?: string; status?: string; limit?: number; offset?: number }): Promise<{ users: User[]; total: number }>;
  updateUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<User | null>;
  getPendingMentorVerifications(): Promise<(MentorProfile & { user: User })[]>;
  verifyMentor(userId: string, status: 'APPROVED' | 'REJECTED', notes?: string): Promise<MentorProfile | null>;
  getReports(): Promise<Report[]>;
  resolveReport(reportId: string, status: 'RESOLVED' | 'DISMISSED', adminNotes?: string): Promise<Report | null>;
  getReviewsForModeration(): Promise<Review[]>;
  moderateReview(reviewId: string, isApproved: boolean): Promise<boolean>;
  getProjects(): Promise<any[]>;
}

export class MongoAdminRepository implements IAdminRepository {
  async getAnalytics(): Promise<AdminAnalytics> {
    const [
      totalUsers,
      totalStudents,
      totalMentors,
      totalActiveProjects,
      totalCompletedProjects,
      totalSessions,
      pendingVerifications,
      pendingReports,
      requestsAccepted,
      requestsTotal
    ] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.countDocuments({ role: 'STUDENT' }),
      UserModel.countDocuments({ role: 'MENTOR' }),
      ProjectModel.countDocuments({ status: 'IN_PROGRESS' }),
      ProjectModel.countDocuments({ status: 'COMPLETED' }),
      MentorshipSessionModel.countDocuments({ status: 'COMPLETED' }),
      MentorProfileModel.countDocuments({
        $or: [{ verificationStatus: 'PENDING' }, { isVerified: false }]
      }),
      ReportModel.countDocuments({ status: 'PENDING' }),
      MentorshipRequestModel.countDocuments({ status: 'ACCEPTED' }),
      MentorshipRequestModel.countDocuments()
    ]);

    const acceptanceRate = requestsTotal > 0 ? Math.round((requestsAccepted / requestsTotal) * 100) : 85;

    const monthlyGrowth = [
      { month: 'Mar', students: 45, mentors: 12, sessions: 38 },
      { month: 'Apr', students: 82, mentors: 24, sessions: 95 },
      { month: 'May', students: 138, mentors: 39, sessions: 180 },
      { month: 'Jun', students: 210, mentors: 58, sessions: 310 },
      { month: 'Jul', students: 340, mentors: 86, sessions: 520 },
      { month: 'Aug', students: 490, mentors: 120, sessions: 780 }
    ];

    const popularTechnologies = [
      { name: 'React / Next.js', count: 142 },
      { name: 'Python / PyTorch', count: 118 },
      { name: 'Node.js / Express', count: 96 },
      { name: 'Go / Distributed Systems', count: 64 },
      { name: 'Rust / WebAssembly', count: 48 },
      { name: 'Flutter / Mobile', count: 42 }
    ];

    const domainDistribution = [
      { domain: 'Full Stack & Web Architecture', percentage: 38 },
      { domain: 'Applied AI & Machine Learning', percentage: 32 },
      { domain: 'Distributed Systems & Cloud', percentage: 18 },
      { domain: 'Mobile App Development', percentage: 12 }
    ];

    return {
      totalUsers,
      totalStudents,
      totalMentors,
      totalActiveMentorships: totalActiveProjects,
      totalCompletedProjects,
      totalSessions,
      pendingVerifications,
      pendingReports,
      acceptanceRate,
      monthlyGrowth,
      popularTechnologies,
      domainDistribution
    };
  }

  async getUsers(filters: { search?: string; role?: string; status?: string; limit?: number; offset?: number }) {
    const query: any = {};

    if (filters.search) {
      query.$or = [
        { fullName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } }
      ];
    }

    if (filters.role) query.role = filters.role;
    if (filters.status) query.status = filters.status;

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const [docs, total] = await Promise.all([
      UserModel.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit).lean(),
      UserModel.countDocuments(query)
    ]);

    const users: User[] = docs.map(r => ({
      id: r._id,
      email: r.email,
      role: r.role,
      fullName: r.fullName,
      avatarUrl: r.avatarUrl || undefined,
      bio: r.bio || undefined,
      headline: r.headline || undefined,
      status: r.status,
      createdAt: toIso(r.createdAt),
      updatedAt: toIso(r.updatedAt)
    }));

    return { users, total };
  }

  async updateUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<User | null> {
    const updated = await UserModel.findByIdAndUpdate(userId, { status }, { returnDocument: 'after' }).lean();
    if (!updated) return null;

    return {
      id: updated._id,
      email: updated.email,
      role: updated.role,
      fullName: updated.fullName,
      avatarUrl: updated.avatarUrl || undefined,
      bio: updated.bio || undefined,
      headline: updated.headline || undefined,
      status: updated.status,
      createdAt: toIso(updated.createdAt),
      updatedAt: toIso(updated.updatedAt)
    };
  }

  async getPendingMentorVerifications(): Promise<(MentorProfile & { user: User })[]> {
    const mentorDocs = await MentorProfileModel.find({
      $or: [
        { verificationStatus: 'PENDING' },
        { isVerified: false }
      ]
    })
      .sort({ createdAt: 1 })
      .lean();

    const userIds = mentorDocs.map(m => m.userId);
    const userDocs = await UserModel.find({ _id: { $in: userIds } }).lean();
    const userMap = new Map(userDocs.map(u => [u._id, u]));

    return mentorDocs.map(m => {
      const u = userMap.get(m.userId);
      return {
        userId: m.userId,
        title: m.title || '',
        company: m.company || '',
        college: m.college || '',
        yearsExperience: m.yearsExperience || 0,
        bio: m.bio || '',
        skills: m.skills || [],
        technologies: m.technologies || [],
        mentoringTopics: m.mentoringTopics || [],
        experienceHighlights: m.experienceHighlights || [],
        projectsExperience: m.projectsExperience || '',
        availabilitySchedule: m.availabilitySchedule || '',
        hourlyRate: m.hourlyRate || 0,
        isVerified: Boolean(m.isVerified),
        verificationStatus: m.verificationStatus,
        verificationNotes: m.verificationNotes || undefined,
        rating: m.rating || 5.0,
        reviewsCount: m.reviewsCount || 0,
        studentsHelpedCount: m.studentsHelpedCount || 0,
        onboardingStep: m.onboardingStep || 1,
        isCompleted: Boolean(m.isCompleted),
        githubUrl: m.githubUrl || undefined,
        linkedinUrl: m.linkedinUrl || undefined,
        websiteUrl: m.websiteUrl || undefined,
        createdAt: toIso(m.createdAt),
        updatedAt: toIso(m.updatedAt),
        user: {
          id: u?._id || m.userId,
          email: u?.email || '',
          role: u?.role || 'MENTOR',
          fullName: u?.fullName || 'Mentor',
          avatarUrl: u?.avatarUrl,
          bio: u?.bio,
          headline: u?.headline,
          status: u?.status || 'ACTIVE',
          createdAt: toIso(u?.createdAt),
          updatedAt: toIso(u?.updatedAt)
        }
      };
    });
  }

  async verifyMentor(userId: string, status: 'APPROVED' | 'REJECTED', notes?: string): Promise<MentorProfile | null> {
    const isVerified = status === 'APPROVED';
    const updated = await MentorProfileModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          isVerified,
          verificationStatus: status,
          verificationNotes: notes || null
        }
      },
      { returnDocument: 'after' }
    ).lean();

    if (!updated) return null;

    return {
      userId: updated.userId,
      title: updated.title || '',
      company: updated.company || '',
      college: updated.college || '',
      yearsExperience: updated.yearsExperience || 0,
      bio: updated.bio || '',
      skills: updated.skills || [],
      technologies: updated.technologies || [],
      mentoringTopics: updated.mentoringTopics || [],
      experienceHighlights: updated.experienceHighlights || [],
      projectsExperience: updated.projectsExperience || '',
      availabilitySchedule: updated.availabilitySchedule || '',
      hourlyRate: updated.hourlyRate || 0,
      isVerified: Boolean(updated.isVerified),
      verificationStatus: updated.verificationStatus,
      verificationNotes: updated.verificationNotes || undefined,
      rating: updated.rating || 5.0,
      reviewsCount: updated.reviewsCount || 0,
      studentsHelpedCount: updated.studentsHelpedCount || 0,
      onboardingStep: updated.onboardingStep || 1,
      isCompleted: Boolean(updated.isCompleted),
      githubUrl: updated.githubUrl || undefined,
      linkedinUrl: updated.linkedinUrl || undefined,
      websiteUrl: updated.websiteUrl || undefined,
      createdAt: toIso(updated.createdAt),
      updatedAt: toIso(updated.updatedAt)
    };
  }

  async getReports(): Promise<Report[]> {
    const repDocs = await ReportModel.find().sort({ createdAt: -1 }).lean();
    const userIds: string[] = [
      ...repDocs.map(r => r.reporterId),
      ...repDocs.map(r => r.reportedUserId).filter((id): id is string => Boolean(id))
    ];

    const users = await UserModel.find({ _id: { $in: userIds } }).lean();
    const userMap = new Map(users.map(u => [u._id, u]));

    return repDocs.map(r => {
      const repUser = userMap.get(r.reporterId);
      const targetUser = r.reportedUserId ? userMap.get(r.reportedUserId) : null;

      return {
        id: r._id,
        reporterId: r.reporterId,
        reportedUserId: r.reportedUserId || undefined,
        reportType: r.reportType,
        reason: r.reason,
        details: r.details,
        status: r.status,
        adminNotes: r.adminNotes || undefined,
        createdAt: toIso(r.createdAt),
        updatedAt: toIso(r.updatedAt),
        reporter: {
          id: r.reporterId,
          fullName: repUser?.fullName || 'Reporter',
          role: repUser?.role || 'STUDENT'
        },
        reportedUser: targetUser ? {
          id: targetUser._id,
          fullName: targetUser.fullName,
          role: targetUser.role
        } : undefined
      };
    });
  }

  async resolveReport(reportId: string, status: 'RESOLVED' | 'DISMISSED', adminNotes?: string): Promise<Report | null> {
    await ReportModel.findByIdAndUpdate(reportId, {
      status,
      adminNotes: adminNotes || null
    });

    const reports = await this.getReports();
    return reports.find(r => r.id === reportId) || null;
  }

  async getReviewsForModeration(): Promise<Review[]> {
    const docs = await ReviewModel.find().sort({ createdAt: -1 }).lean();
    const studentIds = docs.map(d => d.studentId);
    const projectIds: string[] = docs.map(d => d.projectId).filter((id): id is string => Boolean(id));

    const [students, projects] = await Promise.all([
      UserModel.find({ _id: { $in: studentIds } }).lean(),
      ProjectModel.find({ _id: { $in: projectIds } }).lean()
    ]);

    const studentMap = new Map(students.map(s => [s._id, s]));
    const projectMap = new Map(projects.map(p => [p._id, p]));

    return docs.map(r => {
      const s = studentMap.get(r.studentId);
      const p = r.projectId ? projectMap.get(r.projectId) : null;

      return {
        id: r._id,
        studentId: r.studentId,
        mentorId: r.mentorId,
        projectId: r.projectId || undefined,
        rating: r.rating,
        comment: r.comment,
        isVerifiedMentorship: Boolean(r.isVerifiedMentorship),
        isApproved: Boolean(r.isApproved),
        createdAt: toIso(r.createdAt),
        student: {
          id: r.studentId,
          fullName: s?.fullName || 'Student',
          avatarUrl: s?.avatarUrl || undefined
        },
        project: p ? {
          id: p._id,
          title: p.title
        } : undefined
      };
    });
  }

  async moderateReview(reviewId: string, isApproved: boolean): Promise<boolean> {
    if (isApproved) {
      await ReviewModel.findByIdAndUpdate(reviewId, { isApproved: true });
    } else {
      await ReviewModel.findByIdAndDelete(reviewId);
    }
    return true;
  }

  async getProjects(): Promise<any[]> {
    const projects = await ProjectModel.find().lean();
    return projects.map((p: any) => ({
      ...p,
      id: p._id?.toString() || p.id
    }));
  }
}

export { MongoAdminRepository as SqliteAdminRepository };
