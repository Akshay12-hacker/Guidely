/**
 * Cloudinary Free-Tier Optimization Utilities
 * Generates bandwidth-efficient, responsive URLs on the fly
 */

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'thumb' | 'limit' | 'scale' | 'fit';
  gravity?: 'face' | 'auto' | 'center';
  quality?: 'auto' | 'auto:good' | 'auto:eco' | 'auto:low';
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
}

/**
 * Injects responsive transformation parameters into Cloudinary URLs
 * Avoids loading full-resolution media when a small avatar or card thumbnail is displayed.
 */
export function getOptimizedCloudinaryUrl(
  url?: string | null,
  options: CloudinaryTransformOptions = {}
): string {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com')) return url;
  // If URL already has transformation injected, return as-is
  if (url.includes('/w_') || url.includes('/c_')) return url;

  const parts: string[] = [];
  if (options.width) parts.push(`w_${options.width}`);
  if (options.height) parts.push(`h_${options.height}`);
  if (options.crop) parts.push(`c_${options.crop}`);
  if (options.gravity) parts.push(`g_${options.gravity}`);
  parts.push(`q_${options.quality || 'auto'}`);
  parts.push(`f_${options.format || 'auto'}`);

  const transformString = parts.join(',');

  return url.replace('/upload/', `/upload/${transformString}/`);
}

/**
 * Generates a lightweight video poster image thumbnail from the first frame of a Cloudinary video.
 * Allows displaying video previews without downloading the full multi-megabyte video file.
 */
export function getVideoPosterUrl(videoUrl?: string | null, width = 800): string {
  if (!videoUrl) return '';
  if (!videoUrl.includes('res.cloudinary.com')) return '';

  let poster = videoUrl.replace(
    '/upload/',
    `/upload/so_0,w_${width},c_limit,q_auto,f_auto/`
  );
  poster = poster.replace(/\.[a-zA-Z0-9]+$/, '.jpg');
  return poster;
}

/**
 * Format bytes into human-readable format
 */
export function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
