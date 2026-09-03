import jwt from 'jsonwebtoken';
import { UserRole } from '../types.js';
import { env } from '../../config/env.js';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export class JwtService {
  private static get secret(): string {
    return process.env.JWT_SECRET || env.JWT_SECRET;
  }

  private static get expiresIn(): any {
    return process.env.JWT_EXPIRES_IN || env.JWT_EXPIRES_IN;
  }

  static sign(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  static verify(token: string): JwtPayload {
    return jwt.verify(token, this.secret) as JwtPayload;
  }
}
