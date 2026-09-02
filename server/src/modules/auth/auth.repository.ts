import { UserModel } from '../../infrastructure/database/models/index.js';
import { User, UserRole, UserStatus } from '../../shared/types.js';

export interface IAuthRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<(User & { passwordHash: string }) | null>;
  create(user: {
    id: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    fullName: string;
    avatarUrl?: string;
    bio?: string;
    headline?: string;
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
  }): Promise<User>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
  updateProfile(userId: string, data: Partial<User>): Promise<User | null>;
}

export class MongoAuthRepository implements IAuthRepository {
  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id).lean();
    if (!doc) return null;
    return this.mapDocToUser(doc);
  }

  async findByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() }).lean();
    if (!doc) return null;
    return {
      ...this.mapDocToUser(doc),
      passwordHash: doc.passwordHash
    };
  }

  async create(user: {
    id: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    fullName: string;
    avatarUrl?: string;
    bio?: string;
    headline?: string;
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
  }): Promise<User> {
    const created = await UserModel.create({
      _id: user.id,
      email: user.email.toLowerCase(),
      passwordHash: user.passwordHash,
      role: user.role,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      headline: user.headline,
      status: user.status
    });

    return this.mapDocToUser(created.toObject());
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { passwordHash });
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User | null> {
    const updated = await UserModel.findByIdAndUpdate(
      userId,
      {
        fullName: data.fullName,
        avatarUrl: data.avatarUrl,
        bio: data.bio,
        headline: data.headline,
        status: data.status
      },
      { new: true }
    ).lean();

    if (!updated) return null;
    return this.mapDocToUser(updated);
  }

  private mapDocToUser(doc: any): User {
    return {
      id: doc._id || doc.id,
      email: doc.email,
      role: doc.role as UserRole,
      fullName: doc.fullName,
      avatarUrl: doc.avatarUrl,
      bio: doc.bio,
      headline: doc.headline,
      status: doc.status as UserStatus,
      createdAt: doc.createdAt?.toISOString ? doc.createdAt.toISOString() : (doc.createdAt || new Date().toISOString()),
      updatedAt: doc.updatedAt?.toISOString ? doc.updatedAt.toISOString() : (doc.updatedAt || new Date().toISOString())
    };
  }
}

// Keep export alias for backward compatibility
export { MongoAuthRepository as SqliteAuthRepository };
