import bcrypt from 'bcryptjs';
import { env } from '../../config/env.js';

export class PasswordHasher {
  private static get saltRounds(): number {
    return parseInt(process.env.BCRYPT_SALT_ROUNDS || '', 10) || env.BCRYPT_SALT_ROUNDS;
  }

  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
