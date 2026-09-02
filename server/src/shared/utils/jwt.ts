import jwt from 'jsonwebtoken';
import { UserRole } from '../types.js';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export class JwtService {
  private static readonly SECRET = process.env.JWT_SECRET || 'guidely-super-secret-jwt-key-2026-production-ready';
  private static readonly EXPIRES_IN = '7d';

  static sign(payload: JwtPayload): string {
    return jwt.sign(payload, this.SECRET, { expiresIn: this.EXPIRES_IN });
  }

  static verify(token: string): JwtPayload {
    return jwt.verify(token, this.SECRET) as JwtPayload;
  }
}
