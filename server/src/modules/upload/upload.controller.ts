import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware.js';
import { cloudinaryService } from '../../infrastructure/cloudinary/cloudinary.service.js';
import { SqliteAuthRepository } from '../auth/auth.repository.js';
import { MongoProjectRepository } from '../projects/project.repository.js';
import { AppError } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/utils/logger.js';

const ALLOWED_FOLDERS: Record<string, string> = {
  profiles: 'guidely/profiles',
  projects: 'guidely/projects',
  videos: 'guidely/videos',
  documents: 'guidely/documents',
  messages: 'guidely/messages',
  general: 'guidely/general'
};

export class UploadController {
  private authRepo = new SqliteAuthRepository();
  private projectRepo = new MongoProjectRepository();

  /**
   * Upload and update user profile photo
   * Replaces existing photo and removes old Cloudinary asset to avoid orphaned files.
   * Enforces that users can only upload profile photos for themselves.
   */
  uploadProfilePhoto = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw AppError.unauthorized('Authentication required');
      if (!req.file) throw AppError.badRequest('No image file provided');

      const existingUser = await this.authRepo.findById(userId);
      if (!existingUser) throw AppError.notFound('User not found');

      // Cleanup old avatar from Cloudinary if one exists to save Free-Tier storage credits
      if (existingUser.avatarPublicId) {
        try {
          await cloudinaryService.deleteAsset(existingUser.avatarPublicId, 'image');
          logger.info(`Cleaned up old avatar asset for user ${userId}: ${existingUser.avatarPublicId}`);
        } catch (cleanupErr: any) {
          logger.warn(`Could not clean up previous avatar ${existingUser.avatarPublicId}: ${cleanupErr.message}`);
        }
      }

      // Upload new photo with automatic web optimization and safe limit bounds
      const uploadResult = await cloudinaryService.uploadProfilePhoto(req.file.buffer, userId, {
        mimeType: req.file.mimetype,
        filename: req.file.originalname
      });

      // Persist secure Cloudinary URL and publicId in database
      const updatedUser = await this.authRepo.updateProfile(userId, {
        avatarUrl: uploadResult.secureUrl,
        avatarPublicId: uploadResult.publicId
      });

      res.status(200).json({
        success: true,
        message: 'Profile photo updated successfully',
        data: {
          url: uploadResult.secureUrl,
          secureUrl: uploadResult.secureUrl,
          publicId: uploadResult.publicId,
          format: uploadResult.format,
          bytes: uploadResult.bytes,
          width: uploadResult.width,
          height: uploadResult.height,
          user: updatedUser
        }
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Remove user profile photo and delete Cloudinary asset
   */
  deleteProfilePhoto = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw AppError.unauthorized('Authentication required');

      const existingUser = await this.authRepo.findById(userId);
      if (!existingUser) throw AppError.notFound('User not found');

      if (existingUser.avatarPublicId) {
        await cloudinaryService.deleteAsset(existingUser.avatarPublicId, 'image');
      }

      const updatedUser = await this.authRepo.updateProfile(userId, {
        avatarUrl: undefined,
        avatarPublicId: undefined
      });

      res.status(200).json({
        success: true,
        message: 'Profile photo removed successfully',
        data: { user: updatedUser }
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Upload general media (project diagram, session video, resource doc)
   * Enforces project ownership validation when uploading to guidely/projects.
   */
  uploadMedia = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) throw AppError.badRequest('No media file provided');

      const requestedFolder = ((req.body?.folder || req.query?.folder || 'general') as string).toLowerCase();
      const targetFolder = ALLOWED_FOLDERS[requestedFolder] || 'guidely/general';
      const projectId = (req.body?.projectId || req.query?.projectId) as string | undefined;

      // Ownership check: If uploading to projects, verify that the authenticated user is the student, mentor, or admin
      if (requestedFolder === 'projects' && projectId) {
        const project = await this.projectRepo.findById(projectId);
        if (project) {
          const isStudent = project.studentId === req.user?.userId;
          const isMentor = project.mentorId === req.user?.userId;
          const isAdmin = req.user?.role === 'ADMIN';

          if (!isStudent && !isMentor && !isAdmin) {
            throw AppError.forbidden('You are not authorized to upload assets to this project');
          }
        }
      }

      // Auto-detect resource type from mimetype
      const mime = req.file.mimetype.toLowerCase();
      let resourceType: 'image' | 'video' | 'raw' = 'image';
      if (mime.startsWith('video/')) {
        resourceType = 'video';
      } else if (!mime.startsWith('image/')) {
        resourceType = 'raw';
      }

      const originalName = req.file.originalname?.replace(/[^a-zA-Z0-9._-]/g, '_') || 'file';

      const uploadResult = await cloudinaryService.uploadBuffer(req.file.buffer, {
        folder: targetFolder,
        resourceType,
        filename: originalName,
        mimeType: req.file.mimetype,
        tags: ['guidely', requestedFolder, req.user?.userId || 'user']
      });

      res.status(201).json({
        success: true,
        message: 'Media uploaded successfully to Cloudinary',
        data: uploadResult
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Generate signed Cloudinary authorization parameters for client-side direct upload
   */
  getUploadSignature = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const requestedFolder = ((req.body?.folder || req.query?.folder || 'general') as string).toLowerCase();
      const targetFolder = ALLOWED_FOLDERS[requestedFolder] || 'guidely/general';

      const signatureData = cloudinaryService.generateUploadSignature(targetFolder);

      res.status(200).json({
        success: true,
        data: signatureData
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Delete asset by publicId from Cloudinary
   * Enforces security and ownership verification
   */
  deleteMedia = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { publicId, resourceType = 'image' } = req.body;

      if (!publicId || typeof publicId !== 'string') {
        throw AppError.badRequest('Valid publicId is required');
      }

      // Security validation: only permit deleting assets under guidely/ prefix
      if (!publicId.startsWith('guidely/')) {
        throw AppError.forbidden('Can only delete assets within the guidely media repository');
      }

      // If it's a profile asset belonging to another user, prevent deletion unless admin
      if (publicId.startsWith('guidely/profiles/profile_')) {
        const userId = req.user?.userId;
        const isAdmin = req.user?.role === 'ADMIN';
        if (!isAdmin && !publicId.includes(`_${userId}_`)) {
          throw AppError.forbidden('Cannot delete profile photo belonging to another user');
        }
      }

      const success = await cloudinaryService.deleteAsset(publicId, resourceType as any);

      res.status(200).json({
        success,
        message: success ? 'Asset deleted successfully' : 'Asset deletion failed'
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Cloudinary integration status & configuration check
   */
  getStatus = async (_req: AuthenticatedRequest, res: Response) => {
    const status = cloudinaryService.getStatus();
    res.status(200).json({
      success: true,
      data: status
    });
  };
}
