import { MentorProfileModel, UserModel, ReviewModel, ProjectModel, StudentProfileModel } from '../../infrastructure/database/models/index.js';
import { MentorProfile, MentorFilters, User } from '../../shared/types.js';

export interface IMentorRepository {
  findByUserId(userId: string): Promise<MentorProfile | null>;
  upsert(profile: Partial<MentorProfile> & { userId: string }): Promise<MentorProfile>;
  searchAndFilter(filters: MentorFilters): Promise<(MentorProfile & { user: User })[]>;
  getMentorWithDetails(userId: string): Promise<{
    mentor: MentorProfile & { user: User };
    reviews: any[];
    studentsHelped: any[];
  } | null>;
}

export class MongoMentorRepository implements IMentorRepository {
  async findByUserId(userId: string): Promise<MentorProfile | null> {
    const doc = await MentorProfileModel.findOne({ userId }).lean();
    if (!doc) return null;
    return this.mapDocToProfile(doc);
  }

  async upsert(profile: Partial<MentorProfile> & { userId: string }): Promise<MentorProfile> {
    const updateData: any = {};
    if (profile.title !== undefined) updateData.title = profile.title;
    if (profile.company !== undefined) updateData.company = profile.company;
    if (profile.college !== undefined) updateData.college = profile.college;
    if (profile.yearsExperience !== undefined) updateData.yearsExperience = profile.yearsExperience;
    if (profile.bio !== undefined) updateData.bio = profile.bio;
    if (profile.skills !== undefined) updateData.skills = profile.skills;
    if (profile.technologies !== undefined) updateData.technologies = profile.technologies;
    if (profile.mentoringTopics !== undefined) updateData.mentoringTopics = profile.mentoringTopics;
    if (profile.experienceHighlights !== undefined) updateData.experienceHighlights = profile.experienceHighlights;
    if (profile.projectsExperience !== undefined) updateData.projectsExperience = profile.projectsExperience;
    if (profile.availabilitySchedule !== undefined) updateData.availabilitySchedule = profile.availabilitySchedule;
    if (profile.availabilityDetails !== undefined) updateData.availabilityDetails = profile.availabilityDetails;
    if (profile.hourlyRate !== undefined) updateData.hourlyRate = profile.hourlyRate;
    if (profile.isVerified !== undefined) updateData.isVerified = profile.isVerified;
    if (profile.verificationStatus !== undefined) updateData.verificationStatus = profile.verificationStatus;
    if (profile.verificationNotes !== undefined) updateData.verificationNotes = profile.verificationNotes;
    if (profile.rating !== undefined) updateData.rating = profile.rating;
    if (profile.reviewsCount !== undefined) updateData.reviewsCount = profile.reviewsCount;
    if (profile.studentsHelpedCount !== undefined) updateData.studentsHelpedCount = profile.studentsHelpedCount;
    if (profile.onboardingStep !== undefined) updateData.onboardingStep = profile.onboardingStep;
    if (profile.isCompleted !== undefined) updateData.isCompleted = profile.isCompleted;
    if (profile.githubUrl !== undefined) updateData.githubUrl = profile.githubUrl;
    if (profile.linkedinUrl !== undefined) updateData.linkedinUrl = profile.linkedinUrl;
    if (profile.websiteUrl !== undefined) updateData.websiteUrl = profile.websiteUrl;

    const doc = await MentorProfileModel.findOneAndUpdate(
      { userId: profile.userId },
      {
        $set: updateData,
        $setOnInsert: { userId: profile.userId }
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    ).lean();

    return this.mapDocToProfile(doc);
  }

  async searchAndFilter(filters: MentorFilters): Promise<(MentorProfile & { user: User })[]> {
    const mentorQuery: any = { isCompleted: true };

    if (filters.minExperience && filters.minExperience > 0) {
      mentorQuery.yearsExperience = { $gte: filters.minExperience };
    }

    if (filters.minRating && filters.minRating > 0) {
      mentorQuery.rating = { $gte: filters.minRating };
    }

    if (filters.company) {
      mentorQuery.company = { $regex: filters.company, $options: 'i' };
    }

    let sort: any = { rating: -1, studentsHelpedCount: -1 };
    if (filters.sortBy === 'experience') {
      sort = { yearsExperience: filters.sortOrder === 'asc' ? 1 : -1 };
    } else if (filters.sortBy === 'students') {
      sort = { studentsHelpedCount: filters.sortOrder === 'asc' ? 1 : -1 };
    }

    const mentorDocs = await MentorProfileModel.find(mentorQuery).sort(sort).lean();
    if (!mentorDocs.length) return [];

    const userIds = mentorDocs.map(m => m.userId);
    const userDocs = await UserModel.find({ _id: { $in: userIds }, status: 'ACTIVE' }).lean();
    const userMap = new Map(userDocs.map(u => [u._id, u]));

    const result: (MentorProfile & { user: User })[] = [];

    for (const mDoc of mentorDocs) {
      const uDoc = userMap.get(mDoc.userId);
      if (!uDoc) continue;

      if (filters.search) {
        const s = filters.search.toLowerCase();
        const matchUser = uDoc.fullName?.toLowerCase().includes(s) || uDoc.bio?.toLowerCase().includes(s) || uDoc.headline?.toLowerCase().includes(s);
        const matchTitle = mDoc.title?.toLowerCase().includes(s);
        const matchCompany = mDoc.company?.toLowerCase().includes(s);
        const matchBio = mDoc.bio?.toLowerCase().includes(s);
        const matchSkills = (mDoc.skills || []).some((sk: string) => sk.toLowerCase().includes(s));
        const matchTech = (mDoc.technologies || []).some((tk: string) => tk.toLowerCase().includes(s));
        const matchTopics = (mDoc.mentoringTopics || []).some((tp: string) => tp.toLowerCase().includes(s));
        const matchHighlights = (mDoc.experienceHighlights || []).some((eh: string) => eh.toLowerCase().includes(s));
        const matchProjects = mDoc.projectsExperience?.toLowerCase().includes(s);

        if (!matchUser && !matchTitle && !matchCompany && !matchBio && !matchSkills && !matchTech && !matchTopics && !matchHighlights && !matchProjects) {
          continue;
        }
      }

      const profile = this.mapDocToProfile(mDoc);
      const user: User = this.mapDocToUser(uDoc);

      // In-memory technology, skill, and topic array matching
      if (filters.technologies && filters.technologies.length > 0) {
        const matchTech = filters.technologies.some(t =>
          profile.technologies.some(mt => mt.toLowerCase().includes(t.toLowerCase()))
        );
        if (!matchTech) continue;
      }

      if (filters.skills && filters.skills.length > 0) {
        const matchSkill = filters.skills.some(s =>
          profile.skills.some(ms => ms.toLowerCase().includes(s.toLowerCase()))
        );
        if (!matchSkill) continue;
      }

      if (filters.topics && filters.topics.length > 0) {
        const matchTopic = filters.topics.some(tp =>
          profile.mentoringTopics.some(mt => mt.toLowerCase().includes(tp.toLowerCase()))
        );
        if (!matchTopic) continue;
      }

      if (filters.availability && filters.availability.trim()) {
        const matchAvail = profile.availabilitySchedule?.toLowerCase().includes(filters.availability.toLowerCase());
        if (!matchAvail) continue;
      }

      result.push({ ...profile, user });
    }

    if (filters.sortBy === 'name') {
      result.sort((a, b) => {
        const cmp = a.user.fullName.localeCompare(b.user.fullName);
        return filters.sortOrder === 'desc' ? -cmp : cmp;
      });
    }

    return result;
  }

  async getMentorWithDetails(userId: string) {
    const profileDoc = await MentorProfileModel.findOne({ userId }).lean();
    if (!profileDoc) return null;

    const userDoc = await UserModel.findById(userId).lean();
    if (!userDoc) return null;

    const profile = this.mapDocToProfile(profileDoc);
    const user = this.mapDocToUser(userDoc);

    const reviewDocs = await ReviewModel.find({ mentorId: userId, isApproved: true })
      .sort({ createdAt: -1 })
      .lean();

    const studentIds = [...new Set(reviewDocs.map(r => r.studentId))];
    const studentUserDocs = await UserModel.find({ _id: { $in: studentIds } }).lean();
    const studentProfileDocs = await StudentProfileModel.find({ userId: { $in: studentIds } }).lean();

    const studentUserMap = new Map(studentUserDocs.map(u => [u._id, u]));
    const studentProfileMap = new Map(studentProfileDocs.map(sp => [sp.userId, sp]));

    const reviews = reviewDocs.map(r => {
      const sUser = studentUserMap.get(r.studentId);
      const sProf = studentProfileMap.get(r.studentId);
      return {
        id: r._id,
        studentId: r.studentId,
        mentorId: r.mentorId,
        projectId: r.projectId,
        rating: r.rating,
        comment: r.comment,
        isVerifiedMentorship: r.isVerifiedMentorship,
        isApproved: r.isApproved,
        createdAt: String(r.createdAt || new Date().toISOString()),
        student_name: sUser?.fullName || 'Student',
        student_avatar: sUser?.avatarUrl,
        student_college: sProf?.college || ''
      };
    });

    const projectDocs = await ProjectModel.find({ mentorId: userId }).lean();
    const pStudentIds = [...new Set(projectDocs.map(p => p.studentId))];
    const pStudentUsers = await UserModel.find({ _id: { $in: pStudentIds } }).lean();
    const pStudentProfiles = await StudentProfileModel.find({ userId: { $in: pStudentIds } }).lean();

    const pUserMap = new Map(pStudentUsers.map(u => [u._id, u]));
    const pProfileMap = new Map(pStudentProfiles.map(sp => [sp.userId, sp]));

    const studentsHelped = projectDocs.map(p => {
      const u = pUserMap.get(p.studentId);
      const sp = pProfileMap.get(p.studentId);
      return {
        id: u?._id || p.studentId,
        full_name: u?.fullName || 'Student',
        avatar_url: u?.avatarUrl,
        college: sp?.college || '',
        degree: sp?.degree || '',
        project_title: p.title,
        project_status: p.status
      };
    });

    return {
      mentor: { ...profile, user },
      reviews,
      studentsHelped
    };
  }

  private mapDocToProfile(doc: any): MentorProfile {
    const toIso = (d: any) => d instanceof Date ? d.toISOString() : (typeof d === 'string' ? d : new Date().toISOString());

    return {
      userId: doc.userId,
      title: doc.title || '',
      company: doc.company || '',
      college: doc.college || '',
      yearsExperience: doc.yearsExperience || 0,
      bio: doc.bio || '',
      skills: doc.skills || [],
      technologies: doc.technologies || [],
      mentoringTopics: doc.mentoringTopics || [],
      experienceHighlights: doc.experienceHighlights || [],
      projectsExperience: doc.projectsExperience || '',
      availabilitySchedule: doc.availabilitySchedule || 'Weekends & Evenings',
      availabilityDetails: doc.availabilityDetails || undefined,
      hourlyRate: doc.hourlyRate || 0,
      isVerified: Boolean(doc.isVerified),
      verificationStatus: doc.verificationStatus || 'PENDING',
      verificationNotes: doc.verificationNotes || undefined,
      rating: Number(doc.rating || 5.0),
      reviewsCount: doc.reviewsCount || 0,
      studentsHelpedCount: doc.studentsHelpedCount || 0,
      onboardingStep: doc.onboardingStep || 1,
      isCompleted: Boolean(doc.isCompleted),
      githubUrl: doc.githubUrl || undefined,
      linkedinUrl: doc.linkedinUrl || undefined,
      websiteUrl: doc.websiteUrl || undefined,
      createdAt: toIso(doc.createdAt),
      updatedAt: toIso(doc.updatedAt)
    };
  }

  private mapDocToUser(doc: any): User {
    const toIso = (d: any) => d instanceof Date ? d.toISOString() : (typeof d === 'string' ? d : new Date().toISOString());

    return {
      id: doc._id || doc.id,
      email: doc.email,
      role: doc.role,
      fullName: doc.fullName,
      avatarUrl: doc.avatarUrl,
      bio: doc.bio,
      headline: doc.headline,
      status: doc.status,
      createdAt: toIso(doc.createdAt),
      updatedAt: toIso(doc.updatedAt)
    };
  }
}

export { MongoMentorRepository as SqliteMentorRepository };
