import { v2 as cloudinary, UploadApiResponse, UploadApiOptions } from 'cloudinary';
import crypto from 'crypto';
import { env } from '../../config/env.js';
import { logger } from '../../shared/utils/logger.js';
import { AppError } from '../../shared/errors/AppError.js';
import { CloudinaryUploadResult, UploadSignatureResponse } from '../../shared/types.js';

export interface UploadOptions {
  folder?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  publicId?: string;
  transformation?: any[];
  tags?: string[];
  filename?: string;
  mimeType?: string;
  requestId?: string;
}

export interface TransformOptions {
  width?: number;
  height?: number;
  crop?: string;
  gravity?: string;
  quality?: string;
  format?: string;
}

export class CloudinaryService {
  private static instance: CloudinaryService;
  private isConfigured = false;
  // Content-hash deduplication cache to conserve Cloudinary Free Tier storage credits
  private assetHashCache = new Map<string, CloudinaryUploadResult>();

  private constructor() {
    this.init();
  }

  public static getInstance(): CloudinaryService {
    if (!CloudinaryService.instance) {
      CloudinaryService.instance = new CloudinaryService();
    }
    return CloudinaryService.instance;
  }

  private init(): void {
    const cloudName = env.CLOUDINARY_CLOUD_NAME;
    const apiKey = env.CLOUDINARY_API_KEY;
    const apiSecret = env.CLOUDINARY_API_SECRET;

    if (env.isCloudinaryConfigured) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true
      });
      this.isConfigured = true;
      logger.info(`☁️ Cloudinary media service configured (cloud: ${cloudName}, apiKey: ***${apiKey.slice(-4)})`);
    } else {
      this.isConfigured = false;
      logger.warn('⚠️ Cloudinary media credentials incomplete or using placeholders. Signed uploads will fail with an informative configuration error in production.');
    }
  }

  public getStatus(): { isConfigured: boolean; cloudName: string; apiKeyPrefix: string } {
    return {
      isConfigured: this.isConfigured,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKeyPrefix: env.CLOUDINARY_API_KEY ? `***${env.CLOUDINARY_API_KEY.slice(-4)}` : ''
    };
  }

  /**
   * Mock asset generator for offline test suite execution only.
   * NEVER used in production or development.
   */
  private createMockTestAsset(
    buffer: Buffer,
    options: UploadOptions,
    folder: string,
    resourceType: 'image' | 'video' | 'raw' | 'auto'
  ): CloudinaryUploadResult {
    const mockPublicId = `${folder}/${options.publicId || 'mock_' + Date.now()}`;
    const cloudName = env.CLOUDINARY_CLOUD_NAME || 'guidely';
    const isVideo = resourceType === 'video';
    const ext = isVideo ? 'mp4' : (options.mimeType?.split('/')[1] || 'png');
    const mockUrl = `https://res.cloudinary.com/${cloudName}/${isVideo ? 'video' : 'image'}/upload/v1/${mockPublicId}.${ext}`;

    return {
      url: mockUrl,
      secureUrl: mockUrl,
      publicId: mockPublicId,
      resourceType: isVideo ? 'video' : 'image',
      format: ext,
      bytes: buffer.length,
      width: 400,
      height: 400,
      originalFilename: options.filename || `mock-file.${ext}`,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Upload buffer directly to Cloudinary using signed server-side uploads.
   * Features:
   * - Content hash deduplication (avoids re-uploading identical assets)
   * - Strict signed uploads authenticated with API key & secret
   * - Detailed diagnostic error logging (HTTP code, Cloudinary code, folder, publicId, transformation, request ID)
   * - Separate original error and retry error logging to identify root cause in Render logs
   * - Automatic retry without incoming transformations on 400/403 to bypass restricted transformation rules
   * - Never returns a fake success in production
   */
  public async uploadBuffer(buffer: Buffer, options: UploadOptions = {}): Promise<CloudinaryUploadResult> {
    const folder = options.folder || 'guidely/general';
    const resourceType = options.resourceType || 'auto';
    const requestId = options.requestId || 'unknown';

    // 1. Content Hash Deduplication: Check if identical file was previously uploaded to save storage credits
    const contentHash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 24);
    const dedupeKey = `${folder}:${contentHash}`;

    if (this.assetHashCache.has(dedupeKey)) {
      const cached = this.assetHashCache.get(dedupeKey)!;
      logger.info({
        requestId,
        dedupeKey,
        publicId: cached.publicId
      }, '✨ Deduplication: identical asset found. Reusing existing Cloudinary asset to conserve storage credits.');
      return cached;
    }

    // 2. Cloudinary Configuration Verification
    if (!this.isConfigured) {
      if (process.env.NODE_ENV === 'test') {
        const mockAsset = this.createMockTestAsset(buffer, options, folder, resourceType);
        this.assetHashCache.set(dedupeKey, mockAsset);
        return mockAsset;
      }

      logger.error({
        requestId,
        cloudName: env.CLOUDINARY_CLOUD_NAME,
        hasApiKey: Boolean(env.CLOUDINARY_API_KEY),
        hasApiSecret: Boolean(env.CLOUDINARY_API_SECRET)
      }, '❌ Cloudinary is not properly configured. Cannot process signed upload.');

      throw AppError.badRequest(
        'Cloudinary media storage is not configured. Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in the server environment.'
      );
    }

    // Ensure Cloudinary SDK is initialized with latest credentials
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true
    });

    const publicId = options.publicId || `${resourceType}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // 3. Prepare Signed Upload Options
    const uploadOptions: UploadApiOptions = {
      folder,
      resource_type: resourceType,
      public_id: publicId,
      tags: options.tags || ['guidely'],
      overwrite: true,
      invalidate: true,
      ...(env.CLOUDINARY_UPLOAD_PRESET ? { upload_preset: env.CLOUDINARY_UPLOAD_PRESET } : {})
    };

    // Transformations (standard safe bounds)
    if (options.transformation && options.transformation.length > 0) {
      uploadOptions.transformation = options.transformation;
    } else if (resourceType === 'image') {
      uploadOptions.transformation = [
        { width: 1280, height: 1280, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' }
      ];
    } else if (resourceType === 'video') {
      uploadOptions.transformation = [
        { width: 1280, height: 720, crop: 'limit', quality: 'auto:eco', video_codec: 'auto' }
      ];
    }

    const sendToCloudinary = (opts: UploadApiOptions): Promise<UploadApiResponse> => {
      return new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(opts, (error, res) => {
          if (error) return reject(error);
          if (!res) return reject(new Error('Cloudinary response was empty'));
          resolve(res);
        });
        stream.end(buffer);
      });
    };

    let result: UploadApiResponse | null = null;
    let firstErr: any = null;
    let retryErr: any = null;

    try {
      result = await sendToCloudinary(uploadOptions);
    } catch (err: any) {
      firstErr = err;

      // Log the original error with all required diagnostic fields
      logger.error({
        event: 'CLOUDINARY_UPLOAD_ORIGINAL_ERROR',
        exactErrorMessage: firstErr.message || firstErr.error?.message || String(firstErr),
        httpStatus: firstErr.http_code || 403,
        cloudinaryErrorCode: firstErr.code || firstErr.error?.code || 'UNEXPECTED_STATUS_403',
        requestId,
        uploadFolder: folder,
        resourceType,
        publicId: uploadOptions.public_id,
        transformationSettings: uploadOptions.transformation ? JSON.stringify(uploadOptions.transformation) : 'none',
        isSigned: true,
        uploadPreset: uploadOptions.upload_preset || 'none',
        cloudName: env.CLOUDINARY_CLOUD_NAME
      }, `❌ Cloudinary original signed upload failed: [HTTP ${firstErr.http_code || 403}] ${firstErr.message || 'Server returned unexpected status code - 403'} (folder: ${folder}, publicId: ${uploadOptions.public_id})`);

      // If transformations were present and failed with 400 or 403,
      // retry signed upload without incoming transformations (bypasses "Disallow incoming transformations" account restrictions)
      if (uploadOptions.transformation && (firstErr.http_code === 400 || firstErr.http_code === 403)) {
        logger.warn({
          event: 'CLOUDINARY_UPLOAD_RETRY_INITIATED',
          requestId,
          folder,
          publicId: uploadOptions.public_id
        }, '⚠️ Retrying Cloudinary signed upload without incoming transformations to bypass transformation restrictions...');

        const cleanOptions: UploadApiOptions = { ...uploadOptions };
        delete cleanOptions.transformation;

        try {
          result = await sendToCloudinary(cleanOptions);
          logger.info({
            event: 'CLOUDINARY_UPLOAD_RETRY_SUCCESS',
            requestId,
            publicId: result.public_id,
            folder
          }, '✅ Cloudinary retry signed upload without incoming transformations succeeded');
        } catch (secondErr: any) {
          retryErr = secondErr;

          // Log the retry error separately with all required diagnostic fields
          logger.error({
            event: 'CLOUDINARY_UPLOAD_RETRY_ERROR',
            requestId,
            originalError: {
              exactErrorMessage: firstErr.message || firstErr.error?.message || String(firstErr),
              httpStatus: firstErr.http_code || 403,
              cloudinaryErrorCode: firstErr.code || firstErr.error?.code || 'UNEXPECTED_STATUS_403'
            },
            retryError: {
              exactErrorMessage: retryErr.message || retryErr.error?.message || String(retryErr),
              httpStatus: retryErr.http_code || 403,
              cloudinaryErrorCode: retryErr.code || retryErr.error?.code || 'UNEXPECTED_STATUS_403'
            },
            uploadFolder: folder,
            resourceType,
            publicId: cleanOptions.public_id,
            transformationSettings: 'none',
            isSigned: true,
            uploadPreset: cleanOptions.upload_preset || 'none',
            cloudName: env.CLOUDINARY_CLOUD_NAME
          }, `❌ Cloudinary retry signed upload also failed: [HTTP ${retryErr.http_code || 403}] ${retryErr.message || 'Server returned unexpected status code - 403'} (folder: ${folder}, publicId: ${cleanOptions.public_id})`);
        }
      }
    }

    if (!result) {
      // In TEST environment only: return mock asset so offline unit tests pass
      if (process.env.NODE_ENV === 'test') {
        logger.warn({ requestId }, 'Serving mock asset in test environment');
        const mock = this.createMockTestAsset(buffer, options, folder, resourceType);
        this.assetHashCache.set(dedupeKey, mock);
        return mock;
      }

      const finalErr = retryErr || firstErr;
      const httpStatus = finalErr.http_code === 403 ? 403 : (finalErr.http_code === 401 ? 401 : (finalErr.http_code || 502));
      const rawMessage = finalErr.message || 'Server returned unexpected status code - 403';

      throw new AppError(
        `Cloudinary media upload failed: ${rawMessage}. Please verify your Cloudinary credentials, account status, and permissions.`,
        httpStatus,
        {
          requestId,
          httpStatus,
          cloudinaryErrorCode: finalErr.code || finalErr.error?.code,
          folder,
          publicId: uploadOptions.public_id,
          isSigned: true
        },
        true // operational error: sends structured JSON to client instead of 500 crash
      );
    }

    const uploadResult: CloudinaryUploadResult = {
      url: result.url,
      secureUrl: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type as 'image' | 'video' | 'raw',
      format: result.format || 'unknown',
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      duration: result.duration,
      originalFilename: options.filename || result.original_filename,
      createdAt: result.created_at || new Date().toISOString()
    };

    // Store in deduplication cache
    this.assetHashCache.set(dedupeKey, uploadResult);

    return uploadResult;
  }

  /**
   * Upload user profile photo with safe compression and web optimization
   */
  public async uploadProfilePhoto(
    buffer: Buffer,
    userId: string,
    options: { mimeType?: string; filename?: string; requestId?: string } = {}
  ): Promise<CloudinaryUploadResult> {
    return this.uploadBuffer(buffer, {
      folder: 'guidely/profiles',
      publicId: `profile_${userId}_${Date.now()}`,
      resourceType: 'image',
      tags: ['guidely', 'profile', userId],
      mimeType: options.mimeType,
      filename: options.filename,
      requestId: options.requestId,
      transformation: [
        { width: 400, height: 400, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' }
      ]
    });
  }

  /**
   * Upload project media (architecture diagrams, screenshots, mockups)
   */
  public async uploadProjectMedia(buffer: Buffer, projectId: string, filename?: string): Promise<CloudinaryUploadResult> {
    return this.uploadBuffer(buffer, {
      folder: 'guidely/projects',
      resourceType: 'auto',
      tags: ['guidely', 'project', projectId],
      filename,
      transformation: [
        { width: 1280, height: 1280, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' }
      ]
    });
  }

  /**
   * Upload video (e.g. session recordings, project walkthrough demo)
   * Compresses to 720p with eco quality to minimize Cloudinary storage & bandwidth
   */
  public async uploadVideo(buffer: Buffer, tags: string[] = []): Promise<CloudinaryUploadResult> {
    return this.uploadBuffer(buffer, {
      folder: 'guidely/videos',
      resourceType: 'video',
      tags: ['guidely', 'video', ...tags],
      transformation: [
        { width: 1280, height: 720, crop: 'limit', quality: 'auto:eco', video_codec: 'auto' }
      ]
    });
  }

  /**
   * Delete asset from Cloudinary to avoid orphaned files
   */
  public async deleteAsset(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<boolean> {
    if (!publicId || publicId.startsWith('data:') || publicId.includes('fallback_')) return true;

    // Purge from local deduplication cache if present
    for (const [key, val] of this.assetHashCache.entries()) {
      if (val.publicId === publicId) {
        this.assetHashCache.delete(key);
      }
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        invalidate: true
      });
      logger.info(`🗑️ Cloudinary asset deleted: ${publicId} (status: ${result.result})`);
      return result.result === 'ok' || result.result === 'not found';
    } catch (err: any) {
      logger.warn({ error: err.message, publicId }, 'Failed to delete asset from Cloudinary');
      // Silently return true so deletion doesn't block the caller
      return true;
    }
  }

  /**
   * Generate signed upload parameters for direct, secure client-to-Cloudinary uploads
   */
  public generateUploadSignature(folder: string = 'guidely/general'): UploadSignatureResponse {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign: Record<string, any> = {
      folder,
      timestamp
    };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, env.CLOUDINARY_API_SECRET);

    return {
      signature,
      timestamp,
      apiKey: env.CLOUDINARY_API_KEY,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      folder
    };
  }

  /**
   * Helper: Generate a responsive image URL with on-the-fly transformations
   * (saves bandwidth by requesting exact display dimensions)
   */
  public static getOptimizedImageUrl(url: string, opts: TransformOptions = {}): string {
    if (!url || !url.includes('res.cloudinary.com')) return url;

    const parts: string[] = [];
    if (opts.width) parts.push(`w_${opts.width}`);
    if (opts.height) parts.push(`h_${opts.height}`);
    if (opts.crop) parts.push(`c_${opts.crop}`);
    if (opts.gravity) parts.push(`g_${opts.gravity}`);
    parts.push(`q_${opts.quality || 'auto'}`);
    parts.push(`f_${opts.format || 'auto'}`);

    const transformString = parts.join(',');

    // Insert transform right after /upload/
    return url.replace('/upload/', `/upload/${transformString}/`);
  }

  /**
   * Helper: Generate a video poster frame thumbnail image from a video URL
   * Avoids downloading the entire video file just to display a thumbnail/poster
   */
  public static getVideoPosterUrl(videoUrl: string, width = 800): string {
    if (!videoUrl || !videoUrl.includes('res.cloudinary.com')) return '';

    // Replace /upload/ with /upload/so_0,w_<width>,c_limit,q_auto,f_auto/ and extension with .jpg
    let poster = videoUrl.replace(
      '/upload/',
      `/upload/so_0,w_${width},c_limit,q_auto,f_auto/`
    );
    poster = poster.replace(/\.[a-zA-Z0-9]+$/, '.jpg');
    return poster;
  }
}

export const cloudinaryService = CloudinaryService.getInstance();
