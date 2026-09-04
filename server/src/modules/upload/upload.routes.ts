import { Router } from 'express';
import { UploadController } from './upload.controller.js';
import { authenticateToken } from '../auth/auth.middleware.js';
import {
  profilePhotoUpload,
  generalMediaUpload,
  handleUploadErrors,
  uploadRateLimiter
} from './upload.middleware.js';

export function createUploadRouter(): Router {
  const router = Router();
  const controller = new UploadController();

  // All upload endpoints require valid user session authentication
  router.use(authenticateToken);

  // Free-tier abuse prevention rate limiting
  router.use(uploadRateLimiter);

  // Status check (credentials configured, etc.)
  router.get('/status', controller.getStatus);

  // User profile photo endpoints
  router.post(
    '/profile-photo',
    handleUploadErrors(profilePhotoUpload),
    controller.uploadProfilePhoto
  );
  router.delete('/profile-photo', controller.deleteProfilePhoto);

  // General media endpoints (project media, video uploads, session documents)
  router.post(
    '/media',
    handleUploadErrors(generalMediaUpload),
    controller.uploadMedia
  );
  router.delete('/media', controller.deleteMedia);

  // Direct client-to-Cloudinary signature generation
  router.post('/signature', controller.getUploadSignature);

  return router;
}
