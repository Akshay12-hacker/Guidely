import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { AppError } from '../../shared/errors/AppError.js';

// Configure in-memory storage for Cloudinary streaming (zero disk consumption)
const storage = multer.memoryStorage();

const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml'
];

const ALLOWED_VIDEO_MIMES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-matroska',
  'video/ogg'
];

const ALLOWED_DOCUMENT_MIMES = [
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
];

// Cloudinary Free-Tier Sensible Maximums:
// Free tier has 25 credits (~25GB storage/bandwidth shared across account).
// Restricting videos to 50MB and images to 10MB prevents a single user from wiping out monthly limits.
export const MAX_PROFILE_PHOTO_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;        // 10 MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024;        // 50 MB (Free-tier sensible limit)
export const MAX_DOCUMENT_SIZE = 15 * 1024 * 1024;     // 15 MB

// 1. Profile photo uploader (strict image only, max 5MB)
export const profilePhotoUpload = multer({
  storage,
  limits: {
    fileSize: MAX_PROFILE_PHOTO_SIZE
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_MIMES.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(AppError.badRequest('Invalid file type. Profile photo must be JPEG, PNG, WEBP, or GIF.'));
    }
  }
}).single('file');

// 2. Generic media uploader (images, videos, documents, max 50MB)
export const generalMediaUpload = multer({
  storage,
  limits: {
    fileSize: MAX_VIDEO_SIZE
  },
  fileFilter: (_req, file, cb) => {
    const mime = file.mimetype.toLowerCase();
    if (
      ALLOWED_IMAGE_MIMES.includes(mime) ||
      ALLOWED_VIDEO_MIMES.includes(mime) ||
      ALLOWED_DOCUMENT_MIMES.includes(mime)
    ) {
      cb(null, true);
    } else {
      cb(AppError.badRequest(`Unsupported file format: ${file.mimetype}. Allowed: Images (JPG, PNG, WEBP, GIF, SVG), Videos (MP4, WEBM, MOV), Documents (PDF, TXT, DOC, DOCX, PPTX).`));
    }
  }
}).single('file');

// Multer error handling wrapper
export function handleUploadErrors(uploadMiddleware: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    uploadMiddleware(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(AppError.badRequest(`File size exceeds the allowed Cloudinary Free-Tier limit (Maximum 5MB for profile photos, 50MB for video recordings).`));
          }
          return next(AppError.badRequest(`Upload error: ${err.message}`));
        }
        return next(err);
      }
      if (!req.file) {
        return next(AppError.badRequest('No file provided in the "file" field'));
      }

      // Check specific resource type limits
      const mime = req.file.mimetype.toLowerCase();
      if (ALLOWED_IMAGE_MIMES.includes(mime) && req.file.size > MAX_IMAGE_SIZE) {
        return next(AppError.badRequest(`Image file exceeds maximum limit of 10MB for Cloudinary Free Tier.`));
      }
      if (ALLOWED_DOCUMENT_MIMES.includes(mime) && req.file.size > MAX_DOCUMENT_SIZE) {
        return next(AppError.badRequest(`Document file exceeds maximum limit of 15MB.`));
      }

      next();
    });
  };
}

// 3. Free-Tier Abuse Protection: Media Upload Rate Limiter
// Prevents script automation or malicious flooding from exhausting the 25 monthly credits
export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 uploads per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const user = (req as any).user;
    return user?.userId || req.ip || 'anonymous';
  },
  handler: (_req, _res, next) => {
    next(AppError.tooManyRequests('Media upload rate limit reached. To conserve Cloudinary storage credits, please wait before uploading more media.'));
  }
});
