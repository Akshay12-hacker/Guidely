import { StudentProfileModel } from '../../infrastructure/database/models/index.js';
import { StudentProfile } from '../../shared/types.js';

export interface IStudentRepository {
  findByUserId(userId: string): Promise<StudentProfile | null>;
  upsert(profile: Partial<StudentProfile> & { userId: string }): Promise<StudentProfile>;
}

export class MongoStudentRepository implements IStudentRepository {
  async findByUserId(userId: string): Promise<StudentProfile | null> {
    const doc = await StudentProfileModel.findOne({ userId }).lean();
    if (!doc) return null;
    return this.mapDocToProfile(doc);
  }

  async upsert(profile: Partial<StudentProfile> & { userId: string }): Promise<StudentProfile> {
    const updateData: any = {};
    if (profile.college !== undefined) updateData.college = profile.college;
    if (profile.degree !== undefined) updateData.degree = profile.degree;
    if (profile.graduationYear !== undefined) updateData.graduationYear = profile.graduationYear;
    if (profile.currentSkills !== undefined) updateData.currentSkills = profile.currentSkills;
    if (profile.projectIdea !== undefined) updateData.projectIdea = profile.projectIdea;
    if (profile.targetTechnologies !== undefined) updateData.targetTechnologies = profile.targetTechnologies;
    if (profile.helpNeededAreas !== undefined) updateData.helpNeededAreas = profile.helpNeededAreas;
    if (profile.availability !== undefined) updateData.availability = profile.availability;
    if (profile.availabilityDetails !== undefined) updateData.availabilityDetails = profile.availabilityDetails;
    if (profile.onboardingStep !== undefined) updateData.onboardingStep = profile.onboardingStep;
    if (profile.isCompleted !== undefined) updateData.isCompleted = profile.isCompleted;
    if (profile.githubUrl !== undefined) updateData.githubUrl = profile.githubUrl;
    if (profile.linkedinUrl !== undefined) updateData.linkedinUrl = profile.linkedinUrl;

    const doc = await StudentProfileModel.findOneAndUpdate(
      { userId: profile.userId },
      {
        $set: updateData,
        $setOnInsert: { userId: profile.userId }
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    ).lean();

    return this.mapDocToProfile(doc);
  }

  private mapDocToProfile(doc: any): StudentProfile {
    return {
      userId: doc.userId,
      college: doc.college || '',
      degree: doc.degree || '',
      graduationYear: doc.graduationYear || 2026,
      currentSkills: doc.currentSkills || [],
      projectIdea: doc.projectIdea || '',
      targetTechnologies: doc.targetTechnologies || [],
      helpNeededAreas: doc.helpNeededAreas || [],
      availability: doc.availability || '',
      availabilityDetails: doc.availabilityDetails || undefined,
      onboardingStep: doc.onboardingStep || 1,
      isCompleted: Boolean(doc.isCompleted),
      githubUrl: doc.githubUrl || undefined,
      linkedinUrl: doc.linkedinUrl || undefined,
      createdAt: doc.createdAt?.toISOString ? doc.createdAt.toISOString() : (doc.createdAt || new Date().toISOString()),
      updatedAt: doc.updatedAt?.toISOString ? doc.updatedAt.toISOString() : (doc.updatedAt || new Date().toISOString())
    };
  }
}

export { MongoStudentRepository as SqliteStudentRepository };
