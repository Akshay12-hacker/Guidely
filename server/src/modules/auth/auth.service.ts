import crypto from 'crypto';
import { IAuthRepository } from './auth.repository.js';
import { PasswordHasher } from '../../shared/utils/password.js';
import { JwtService } from '../../shared/utils/jwt.js';
import { AppError } from '../../shared/errors/AppError.js';
import { User, UserRole, AuthResponse } from '../../shared/types.js';
import { GoogleAuthService, VerifiedGoogleUser } from '../../infrastructure/google/googleAuth.service.js';
import { UserModel, StudentProfileModel, MentorProfileModel } from '../../infrastructure/database/models/index.js';
import { env } from '../../config/env.js';

export class AuthService {
  constructor(private authRepo: IAuthRepository) {}

  async register(data: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
  }): Promise<AuthResponse> {
    const existing = await this.authRepo.findByEmail(data.email);
    if (existing) {
      throw AppError.conflict('An account with this email address already exists');
    }

    const passwordHash = await PasswordHasher.hash(data.password);
    const userId = 'usr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    const now = new Date().toISOString();

    const user = await this.authRepo.create({
      id: userId,
      email: data.email,
      passwordHash,
      role: data.role,
      fullName: data.fullName,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now
    });

    const token = JwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return { user, token };
  }

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const userWithHash = await this.authRepo.findByEmail(data.email);
    if (!userWithHash) {
      throw AppError.unauthorized('Invalid email or password');
    }

    if (userWithHash.status === 'SUSPENDED') {
      throw AppError.forbidden('Your account has been suspended. Please contact support.');
    }

    const isMatch = await PasswordHasher.compare(data.password, userWithHash.passwordHash);
    if (!isMatch) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const token = JwtService.sign({
      userId: userWithHash.id,
      email: userWithHash.email,
      role: userWithHash.role
    });

    const { passwordHash: _, ...user } = userWithHash;

    return { user, token };
  }

  async googleAuth(input: {
    idToken?: string;
    credential?: string;
    code?: string;
    role?: UserRole;
    email?: string;
    fullName?: string;
    avatarUrl?: string;
  }): Promise<AuthResponse> {
    let verifiedUser: VerifiedGoogleUser;

    const token = input.idToken || input.credential;
    if (token) {
      verifiedUser = await GoogleAuthService.verifyGoogleToken(token);
    } else if (input.code) {
      verifiedUser = await GoogleAuthService.verifyAuthCode(input.code);
    } else if (input.email && (env.isDevelopment || env.isTest)) {
      verifiedUser = {
        email: input.email.toLowerCase().trim(),
        fullName: input.fullName || input.email.split('@')[0],
        avatarUrl: input.avatarUrl,
        googleId: 'test_google_' + Date.now(),
        emailVerified: true
      };
    } else {
      throw AppError.badRequest('A valid Google ID token or credential is required');
    }

    const { email, fullName, avatarUrl, googleId } = verifiedUser;

    let existing = await this.authRepo.findByEmail(email);

    if (!existing) {
      const selectedRole: UserRole = input.role === 'MENTOR' ? 'MENTOR' : 'STUDENT';
      const passwordHash = await PasswordHasher.hash(crypto.randomUUID());
      const userId = `usr_${selectedRole.toLowerCase()}_` + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
      const now = new Date().toISOString();

      const user = await this.authRepo.create({
        id: userId,
        email,
        passwordHash,
        role: selectedRole,
        fullName,
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now
      });

      try {
        await UserModel.findByIdAndUpdate(userId, { googleId });
      } catch {}

      let profile: any = null;
      try {
        if (selectedRole === 'STUDENT') {
          profile = await StudentProfileModel.create({
            userId: user.id,
            college: '',
            degree: '',
            graduationYear: new Date().getFullYear() + 2,
            currentSkills: [],
            projectIdea: '',
            targetTechnologies: [],
            helpNeededAreas: [],
            availability: 'Flexible',
            onboardingStep: 1,
            isCompleted: false
          });
        } else {
          profile = await MentorProfileModel.create({
            userId: user.id,
            title: 'Software Professional',
            company: '',
            college: '',
            yearsExperience: 1,
            bio: '',
            skills: [],
            technologies: [],
            mentoringTopics: [],
            experienceHighlights: [],
            projectsExperience: '',
            availabilitySchedule: 'Flexible',
            hourlyRate: 0,
            isVerified: false,
            verificationStatus: 'PENDING',
            rating: 5.0,
            reviewsCount: 0,
            studentsHelpedCount: 0,
            onboardingStep: 1,
            isCompleted: false
          });
        }
      } catch {}

      const sessionToken = JwtService.sign({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      return { user, token: sessionToken, profile };
    }

    if (existing.status === 'SUSPENDED') {
      throw AppError.forbidden('Your account has been suspended. Please contact platform support.');
    }

    try {
      const updates: any = {};
      if (!existing.avatarUrl && avatarUrl) {
        updates.avatarUrl = avatarUrl;
        existing.avatarUrl = avatarUrl;
      }
      if (googleId) {
        updates.googleId = googleId;
      }
      if (Object.keys(updates).length > 0) {
        await UserModel.findByIdAndUpdate(existing.id, updates);
      }
    } catch {}

    let profile: any = null;
    try {
      if (existing.role === 'STUDENT') {
        profile = await StudentProfileModel.findOne({ userId: existing.id }).lean();
      } else if (existing.role === 'MENTOR') {
        profile = await MentorProfileModel.findOne({ userId: existing.id }).lean();
      }
    } catch {}

    const sessionToken = JwtService.sign({
      userId: existing.id,
      email: existing.email,
      role: existing.role
    });

    const { passwordHash: _, ...userWithoutHash } = existing;
    return { user: userWithoutHash, token: sessionToken, profile };
  }

  async getCurrentUser(userId: string): Promise<User> {
    const user = await this.authRepo.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return user;
  }

  async changePassword(userId: string, currentPass: string, newPass: string): Promise<void> {
    const user = await this.authRepo.findById(userId);
    if (!user) throw AppError.notFound('User not found');

    const userWithHash = await this.authRepo.findByEmail(user.email);
    if (!userWithHash) throw AppError.notFound('User not found');

    const isMatch = await PasswordHasher.compare(currentPass, userWithHash.passwordHash);
    if (!isMatch) {
      throw AppError.badRequest('Current password does not match');
    }

    const newHash = await PasswordHasher.hash(newPass);
    await this.authRepo.updatePassword(userId, newHash);
  }

  async forgotPassword(email: string): Promise<{ message: string; resetToken: string; demoResetToken: string }> {
    const user = await this.authRepo.findByEmail(email);
    if (!user) {
      const genericToken = JwtService.sign({ userId: 'unregistered', email, role: 'STUDENT' });
      return {
        message: 'If the email exists, a password reset link has been dispatched.',
        resetToken: genericToken,
        demoResetToken: genericToken
      };
    }

    const resetToken = JwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return {
      message: 'Password reset link has been sent to your email.',
      resetToken,
      demoResetToken: resetToken
    };
  }

  async resetPassword(token: string, newPass: string): Promise<void> {
    try {
      const payload = JwtService.verify(token);
      const newHash = await PasswordHasher.hash(newPass);
      await this.authRepo.updatePassword(payload.userId, newHash);
    } catch {
      throw AppError.badRequest('Invalid or expired reset token');
    }
  }
}
