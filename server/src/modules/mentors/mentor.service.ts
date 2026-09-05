import { IMentorRepository } from './mentor.repository.js';
import { IAuthRepository } from '../auth/auth.repository.js';
import {
  MentorshipRequestModel,
  ProjectModel,
  MentorshipSessionModel,
  ConversationModel,
  ReviewModel,
  UserModel,
  StudentProfileModel
} from '../../infrastructure/database/models/index.js';
import { AppError } from '../../shared/errors/AppError.js';
import { MentorProfile, MentorFilters } from '../../shared/types.js';
import {
  sanitizeSkillsList,
  sanitizeAvailabilityString,
  sanitizeAvailabilityDetails
} from '../../constants/skills.js';

export class MentorService {
  constructor(
    private mentorRepo: IMentorRepository,
    private authRepo: IAuthRepository
  ) {}

  async getProfile(userId: string): Promise<MentorProfile> {
    let profile = await this.mentorRepo.findByUserId(userId);
    if (!profile) {
      profile = await this.mentorRepo.upsert({ userId, onboardingStep: 1, isCompleted: false });
    }
    return profile;
  }

  async updateProfile(userId: string, data: Partial<MentorProfile>): Promise<MentorProfile> {
    const user = await this.authRepo.findById(userId);
    if (!user) throw AppError.notFound('User not found');

    const sanitizedData = { ...data };
    if (sanitizedData.skills !== undefined) {
      sanitizedData.skills = sanitizeSkillsList(sanitizedData.skills);
    }
    if (sanitizedData.technologies !== undefined) {
      sanitizedData.technologies = sanitizeSkillsList(sanitizedData.technologies);
    }
    if (sanitizedData.mentoringTopics !== undefined) {
      sanitizedData.mentoringTopics = sanitizeSkillsList(sanitizedData.mentoringTopics);
    }
    if (sanitizedData.availabilitySchedule !== undefined) {
      sanitizedData.availabilitySchedule = sanitizeAvailabilityString(sanitizedData.availabilitySchedule);
    }
    if (sanitizedData.availabilityDetails !== undefined) {
      sanitizedData.availabilityDetails = sanitizeAvailabilityDetails(sanitizedData.availabilityDetails);
    }

    return this.mentorRepo.upsert({
      ...sanitizedData,
      userId
    });
  }

  async saveOnboardingStep(userId: string, step: number, stepData: Partial<MentorProfile>): Promise<MentorProfile> {
    const isCompleted = step >= 9;
    const sanitizedData = { ...stepData };
    if (sanitizedData.skills !== undefined) {
      sanitizedData.skills = sanitizeSkillsList(sanitizedData.skills);
    }
    if (sanitizedData.technologies !== undefined) {
      sanitizedData.technologies = sanitizeSkillsList(sanitizedData.technologies);
    }
    if (sanitizedData.mentoringTopics !== undefined) {
      sanitizedData.mentoringTopics = sanitizeSkillsList(sanitizedData.mentoringTopics);
    }
    if (sanitizedData.availabilitySchedule !== undefined) {
      sanitizedData.availabilitySchedule = sanitizeAvailabilityString(sanitizedData.availabilitySchedule);
    }
    if (sanitizedData.availabilityDetails !== undefined) {
      sanitizedData.availabilityDetails = sanitizeAvailabilityDetails(sanitizedData.availabilityDetails);
    }

    return this.mentorRepo.upsert({
      ...sanitizedData,
      userId,
      onboardingStep: step,
      isCompleted
    });
  }

  async discoverMentors(filters: MentorFilters) {
    return this.mentorRepo.searchAndFilter(filters);
  }

  async getMentorDetail(userId: string) {
    const detail = await this.mentorRepo.getMentorWithDetails(userId);
    if (!detail) {
      throw AppError.notFound('Mentor profile not found');
    }
    return detail;
  }

  async getMentorDashboardData(userId: string) {
    const user = await this.authRepo.findById(userId);
    const profile = await this.getProfile(userId);

    // Incoming pending requests
    const incomingReqDocs = await MentorshipRequestModel.find({
      mentorId: userId,
      status: { $in: ['PENDING', 'INFO_REQUESTED', 'INFO_PROVIDED'] }
    }).sort({ createdAt: -1 }).lean();

    const studentIds = incomingReqDocs.map(r => r.studentId);
    const [sUsers, sProfs] = await Promise.all([
      UserModel.find({ _id: { $in: studentIds } }).lean(),
      StudentProfileModel.find({ userId: { $in: studentIds } }).lean()
    ]);
    const sUserMap = new Map(sUsers.map(u => [u._id, u]));
    const sProfMap = new Map(sProfs.map(p => [p.userId, p]));

    const incomingRequests = incomingReqDocs.map(r => {
      const u = sUserMap.get(r.studentId);
      const sp = sProfMap.get(r.studentId);
      return {
        ...r,
        id: r._id,
        student_name: u?.fullName,
        student_avatar: u?.avatarUrl,
        student_college: sp?.college,
        student_degree: sp?.degree,
        student_grad_year: sp?.graduationYear
      };
    });

    // Active students & projects
    const activeProjectDocs = await ProjectModel.find({
      mentorId: userId,
      status: { $ne: 'COMPLETED' }
    }).sort({ updatedAt: -1 }).lean();

    const pStudentIds = activeProjectDocs.map(p => p.studentId);
    const [pUsers, pProfs] = await Promise.all([
      UserModel.find({ _id: { $in: pStudentIds } }).lean(),
      StudentProfileModel.find({ userId: { $in: pStudentIds } }).lean()
    ]);
    const pUserMap = new Map(pUsers.map(u => [u._id, u]));
    const pProfMap = new Map(pProfs.map(p => [p.userId, p]));

    const activeProjects = activeProjectDocs.map(p => {
      const u = pUserMap.get(p.studentId);
      const sp = pProfMap.get(p.studentId);
      return {
        ...p,
        id: p._id,
        student_name: u?.fullName,
        student_avatar: u?.avatarUrl,
        student_college: sp?.college,
        student_degree: sp?.degree
      };
    });

    // Upcoming sessions
    const sessionDocs = await MentorshipSessionModel.find({
      mentorId: userId,
      status: { $in: ['CONFIRMED', 'REQUESTED'] }
    }).sort({ scheduledAt: 1 }).limit(5).lean();

    const sessStudentIds = sessionDocs.map(s => s.studentId);
    const sessProjectIds: string[] = sessionDocs.map(s => s.projectId).filter((id): id is string => Boolean(id));

    const [sessUsers, sessProfs, sessProjects] = await Promise.all([
      UserModel.find({ _id: { $in: sessStudentIds } }).lean(),
      StudentProfileModel.find({ userId: { $in: sessStudentIds } }).lean(),
      ProjectModel.find({ _id: { $in: sessProjectIds } }).lean()
    ]);
    const sessUserMap = new Map(sessUsers.map(u => [u._id, u]));
    const sessProfMap = new Map(sessProfs.map(p => [p.userId, p]));
    const sessProjMap = new Map(sessProjects.map(p => [p._id, p]));

    const upcomingSessions = sessionDocs.map(s => {
      const u = sessUserMap.get(s.studentId);
      const sp = sessProfMap.get(s.studentId);
      const p = s.projectId ? sessProjMap.get(s.projectId) : null;
      return {
        ...s,
        id: s._id,
        student_name: u?.fullName,
        student_avatar: u?.avatarUrl,
        student_college: sp?.college,
        project_title: p?.title
      };
    });

    // Recent conversations
    const convDocs = await ConversationModel.find({ mentorId: userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();

    const cStudentIds = convDocs.map(c => c.studentId);
    const [cUsers, cProfs] = await Promise.all([
      UserModel.find({ _id: { $in: cStudentIds } }).lean(),
      StudentProfileModel.find({ userId: { $in: cStudentIds } }).lean()
    ]);
    const cUserMap = new Map(cUsers.map(u => [u._id, u]));
    const cProfMap = new Map(cProfs.map(p => [p.userId, p]));

    const recentConversations = convDocs.map(c => {
      const u = cUserMap.get(c.studentId);
      const sp = cProfMap.get(c.studentId);
      return {
        ...c,
        id: c._id,
        student_name: u?.fullName,
        student_avatar: u?.avatarUrl,
        student_college: sp?.college
      };
    });

    // Statistics calculations
    const [completedSessions, completedProjects, totalReviews, activeProjectsCount] = await Promise.all([
      MentorshipSessionModel.countDocuments({ mentorId: userId, status: 'COMPLETED' }),
      ProjectModel.countDocuments({ mentorId: userId, status: 'COMPLETED' }),
      ReviewModel.countDocuments({ mentorId: userId, isApproved: true }),
      ProjectModel.find({ mentorId: userId, status: { $ne: 'COMPLETED' } }).distinct('studentId')
    ]);

    return {
      user,
      profile,
      incomingRequests,
      activeProjects,
      upcomingSessions,
      recentConversations,
      stats: {
        activeStudents: activeProjectsCount.length,
        completedSessions,
        completedProjects,
        averageRating: profile.rating,
        totalReviews: totalReviews || profile.reviewsCount
      }
    };
  }
}
