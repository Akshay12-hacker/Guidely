import crypto from 'crypto';
import { IAuthRepository } from './auth.repository.js';
import { PasswordHasher } from '../../shared/utils/password.js';
import { JwtService } from '../../shared/utils/jwt.js';
import { AppError } from '../../shared/errors/AppError.js';
import { User, UserRole, AuthResponse } from '../../shared/types.js';

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

  async googleAuth(data: {
    email: string;
    fullName: string;
    role?: UserRole;
    avatarUrl?: string;
  }): Promise<AuthResponse> {
    let existing = await this.authRepo.findByEmail(data.email);

    if (!existing) {
      const passwordHash = await PasswordHasher.hash(crypto.randomUUID());
      const userId = 'usr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
      const now = new Date().toISOString();

      const user = await this.authRepo.create({
        id: userId,
        email: data.email,
        passwordHash,
        role: data.role || 'STUDENT',
        fullName: data.fullName,
        avatarUrl: data.avatarUrl,
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

    if (existing.status === 'SUSPENDED') {
      throw AppError.forbidden('Your account has been suspended.');
    }

    const token = JwtService.sign({
      userId: existing.id,
      email: existing.email,
      role: existing.role
    });

    const { passwordHash: _, ...user } = existing;
    return { user, token };
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

  async forgotPassword(email: string): Promise<{ message: string; demoResetToken: string }> {
    const user = await this.authRepo.findByEmail(email);
    if (!user) {
      // Return ambiguous message for security, but provide demo token for local testing
      return {
        message: 'If the email exists, a password reset link has been dispatched.',
        demoResetToken: JwtService.sign({ userId: 'demo', email, role: 'STUDENT' })
      };
    }

    const resetToken = JwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return {
      message: 'Password reset link has been sent to your email.',
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
