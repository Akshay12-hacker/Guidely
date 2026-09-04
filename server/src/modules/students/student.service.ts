import { IStudentRepository } from './student.repository.js';
import { IAuthRepository } from '../auth/auth.repository.js';
import {
  ProjectModel,
  MentorshipSessionModel,
  MentorshipRequestModel,
  ConversationModel,
  UserModel,
  MentorProfileModel,
  StudentProfileModel
} from '../../infrastructure/database/models/index.js';
import { AppError } from '../../shared/errors/AppError.js';
import { StudentProfile, SkillItem, SkillsDirectoryResponse, StudentOnboardingOptions } from '../../shared/types.js';
import {
  PRESET_SKILLS,
  SKILL_CATEGORIES,
  TARGET_TECHNOLOGIES,
  HELP_NEEDED_AREAS,
  searchSkillsCatalog,
  normalizeSkillName,
  sanitizeSkillsList
} from '../../constants/skills.js';

export class StudentService {
  constructor(
    private studentRepo: IStudentRepository,
    private authRepo: IAuthRepository
  ) {}

  async getProfile(userId: string): Promise<StudentProfile> {
    let profile = await this.studentRepo.findByUserId(userId);
    if (!profile) {
      profile = await this.studentRepo.upsert({ userId, onboardingStep: 1, isCompleted: false });
    }
    return profile;
  }

  async updateProfile(userId: string, data: Partial<StudentProfile>): Promise<StudentProfile> {
    const user = await this.authRepo.findById(userId);
    if (!user) throw AppError.notFound('User not found');

    const sanitizedData = { ...data };
    if (sanitizedData.currentSkills !== undefined) {
      sanitizedData.currentSkills = sanitizeSkillsList(sanitizedData.currentSkills);
    }
    if (sanitizedData.targetTechnologies !== undefined) {
      sanitizedData.targetTechnologies = sanitizeSkillsList(sanitizedData.targetTechnologies);
    }
    if (sanitizedData.helpNeededAreas !== undefined) {
      sanitizedData.helpNeededAreas = sanitizeSkillsList(sanitizedData.helpNeededAreas);
    }

    return this.studentRepo.upsert({
      ...sanitizedData,
      userId
    });
  }

  async saveOnboardingStep(userId: string, step: number, stepData: Partial<StudentProfile>): Promise<StudentProfile> {
    const isCompleted = step >= 8;
    const sanitizedData = { ...stepData };
    if (sanitizedData.currentSkills !== undefined) {
      sanitizedData.currentSkills = sanitizeSkillsList(sanitizedData.currentSkills);
    }
    if (sanitizedData.targetTechnologies !== undefined) {
      sanitizedData.targetTechnologies = sanitizeSkillsList(sanitizedData.targetTechnologies);
    }
    if (sanitizedData.helpNeededAreas !== undefined) {
      sanitizedData.helpNeededAreas = sanitizeSkillsList(sanitizedData.helpNeededAreas);
    }

    return this.studentRepo.upsert({
      ...sanitizedData,
      userId,
      onboardingStep: step,
      isCompleted
    });
  }

  /**
   * Returns available skills directory with search filtering and custom skills discovery
   */
  async getAvailableSkills(query?: string, category?: string): Promise<SkillsDirectoryResponse> {
    const presetMatches = searchSkillsCatalog(query, category);

    // Retrieve any distinct custom skills added across student profiles in DB
    let customMatches: SkillItem[] = [];
    try {
      const distinctSkills: string[] = await StudentProfileModel.distinct('currentSkills');
      const presetLower = new Set(PRESET_SKILLS.map(s => s.name.toLowerCase()));

      const customStrings = distinctSkills.filter(s => typeof s === 'string' && !presetLower.has(s.toLowerCase()));

      customMatches = customStrings.map(name => ({
        name,
        category: 'Other',
        isCustom: true
      }));

      if (category && category !== 'All') {
        if (category.toLowerCase() === 'other') {
          // keep all custom
        } else {
          customMatches = [];
        }
      }

      if (query && query.trim()) {
        const q = query.trim().toLowerCase();
        customMatches = customMatches.filter(s => s.name.toLowerCase().includes(q));
      }
    } catch {
      // fallback to preset skills if database distinct query fails
    }

    const allSkills = [...customMatches, ...presetMatches];
    const seen = new Set<string>();
    const unique = allSkills.filter(item => {
      const lower = item.name.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });

    return {
      skills: unique,
      categories: Array.from(SKILL_CATEGORIES),
      total: unique.length
    };
  }

  /**
   * Add a custom skill to the student's profile directly
   */
  async addCustomSkill(userId: string, rawSkill: string): Promise<{ profile: StudentProfile; addedSkill: string }> {
    if (!rawSkill || typeof rawSkill !== 'string' || !rawSkill.trim()) {
      throw AppError.badRequest('Skill name is required and cannot be empty');
    }

    const cleaned = normalizeSkillName(rawSkill);
    if (cleaned.length > 60) {
      throw AppError.badRequest('Skill name exceeds maximum length of 60 characters');
    }

    const profile = await this.getProfile(userId);
    const existing = profile.currentSkills || [];
    const lower = cleaned.toLowerCase();

    let updatedSkills = existing;
    if (!existing.some(s => s.toLowerCase() === lower)) {
      updatedSkills = sanitizeSkillsList([...existing, cleaned]);
    }

    const updated = await this.studentRepo.upsert({
      userId,
      currentSkills: updatedSkills
    });

    return {
      profile: updated,
      addedSkill: cleaned
    };
  }

  async getDashboardData(userId: string) {
    const profile = await this.getProfile(userId);
    const user = await this.authRepo.findById(userId);

    let completedFields = 0;
    const fieldsToCheck = [
      profile.college,
      profile.degree,
      profile.currentSkills.length > 0,
      profile.projectIdea,
      profile.targetTechnologies.length > 0,
      profile.helpNeededAreas.length > 0,
      profile.availability
    ];
    fieldsToCheck.forEach(f => { if (f) completedFields++; });
    const profileCompletionPercentage = Math.round((completedFields / fieldsToCheck.length) * 100);

    const activeProjectDoc = await ProjectModel.findOne({
      studentId: userId,
      status: { $ne: 'COMPLETED' }
    }).sort({ updatedAt: -1 }).lean();

    let activeProject = null;
    if (activeProjectDoc) {
      const mentorUser = activeProjectDoc.mentorId ? await UserModel.findById(activeProjectDoc.mentorId).lean() : null;
      const mentorProf = activeProjectDoc.mentorId ? await MentorProfileModel.findOne({ userId: activeProjectDoc.mentorId }).lean() : null;
      activeProject = {
        ...activeProjectDoc,
        id: activeProjectDoc._id,
        mentor_name: mentorUser?.fullName,
        mentor_avatar: mentorUser?.avatarUrl,
        mentor_title: mentorProf?.title,
        mentor_company: mentorProf?.company
      };
    }

    const nextSessionDoc = await MentorshipSessionModel.findOne({
      studentId: userId,
      status: { $in: ['CONFIRMED', 'REQUESTED'] }
    }).sort({ scheduledAt: 1 }).lean();

    let nextSession = null;
    if (nextSessionDoc) {
      const mentorUser = await UserModel.findById(nextSessionDoc.mentorId).lean();
      const mentorProf = await MentorProfileModel.findOne({ userId: nextSessionDoc.mentorId }).lean();
      nextSession = {
        ...nextSessionDoc,
        id: nextSessionDoc._id,
        mentor_name: mentorUser?.fullName,
        mentor_avatar: mentorUser?.avatarUrl,
        mentor_company: mentorProf?.company
      };
    }

    const pendingReqDocs = await MentorshipRequestModel.find({
      studentId: userId,
      status: { $in: ['PENDING', 'INFO_REQUESTED'] }
    }).sort({ createdAt: -1 }).lean();

    const pendingMentorIds = pendingReqDocs.map(r => r.mentorId);
    const [pMentorUsers, pMentorProfs] = await Promise.all([
      UserModel.find({ _id: { $in: pendingMentorIds } }).lean(),
      MentorProfileModel.find({ userId: { $in: pendingMentorIds } }).lean()
    ]);
    const pUserMap = new Map(pMentorUsers.map(u => [u._id, u]));
    const pProfMap = new Map(pMentorProfs.map(p => [p.userId, p]));

    const pendingRequests = pendingReqDocs.map(r => {
      const u = pUserMap.get(r.mentorId);
      const p = pProfMap.get(r.mentorId);
      return {
        ...r,
        id: r._id,
        mentor_name: u?.fullName,
        mentor_avatar: u?.avatarUrl,
        mentor_title: p?.title,
        mentor_company: p?.company
      };
    });

    const recentConvDocs = await ConversationModel.find({ studentId: userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();

    const convMentorIds = recentConvDocs.map(c => c.mentorId);
    const convMentorUsers = await UserModel.find({ _id: { $in: convMentorIds } }).lean();
    const convMentorProfs = await MentorProfileModel.find({ userId: { $in: convMentorIds } }).lean();
    const cUserMap = new Map(convMentorUsers.map(u => [u._id, u]));
    const cProfMap = new Map(convMentorProfs.map(p => [p.userId, p]));

    const recentConversations = recentConvDocs.map(c => {
      const u = cUserMap.get(c.mentorId);
      const p = cProfMap.get(c.mentorId);
      return {
        ...c,
        id: c._id,
        mentor_name: u?.fullName,
        mentor_avatar: u?.avatarUrl,
        mentor_title: p?.title,
        mentor_company: p?.company
      };
    });

    const recommendedMentorDocs = await MentorProfileModel.find({ isCompleted: true })
      .sort({ rating: -1, studentsHelpedCount: -1 })
      .limit(4)
      .lean();

    const rUserIds = recommendedMentorDocs.map(m => m.userId);
    const rUsers = await UserModel.find({ _id: { $in: rUserIds }, status: 'ACTIVE' }).lean();
    const rUserMap = new Map(rUsers.map(u => [u._id, u]));

    const formattedMentors = recommendedMentorDocs
      .filter(m => rUserMap.has(m.userId))
      .map(m => {
        const u = rUserMap.get(m.userId)!;
        return {
          id: u._id,
          full_name: u.fullName,
          avatar_url: u.avatarUrl,
          headline: u.headline,
          title: m.title,
          company: m.company,
          years_experience: m.yearsExperience,
          skills: m.skills,
          technologies: m.technologies,
          rating: m.rating,
          reviews_count: m.reviewsCount,
          students_helped_count: m.studentsHelpedCount,
          availability_schedule: m.availabilitySchedule
        };
      });

    return {
      user,
      profile,
      profileCompletionPercentage,
      activeProject,
      nextSession,
      pendingRequests,
      recentConversations,
      recommendedMentors: formattedMentors
    };
  }

  getOnboardingOptions(): StudentOnboardingOptions {
    return {
      targetTechnologies: [...TARGET_TECHNOLOGIES],
      helpNeededAreas: [...HELP_NEEDED_AREAS],
      skillCategories: [...SKILL_CATEGORIES]
    };
  }
}
