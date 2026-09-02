import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware.js';
import { SqliteAuthRepository } from '../auth/auth.repository.js';
import { z } from 'zod';

const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  bio: z.string().optional(),
  headline: z.string().optional(),
  avatarUrl: z.string().optional()
});

export class UserController {
  private authRepo = new SqliteAuthRepository();

  updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const validated = updateProfileSchema.parse(req.body);
      const updated = await this.authRepo.updateProfile(req.user!.userId, validated);
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  };

  getUserById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await this.authRepo.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  };
}
