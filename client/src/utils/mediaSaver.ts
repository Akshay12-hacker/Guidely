/**
 * WhatsApp-Style Media Saving Utility for Android & Web
 * Saves media to device Gallery / Downloads without re-uploading to Guidely
 */

import { mediaCache } from '../services/mediaCache.js';

export interface SaveMediaOptions {
  url: string;
  filename?: string;
  mimeType?: string;
  onProgress?: (progressPercent: number) => void;
  requestPermission?: boolean;
}

export interface SaveMediaResult {
  success: boolean;
  savedPath?: string;
  message?: string;
  isAndroid: boolean;
  isCachedLocally: boolean;
}

/**
 * Detect if running on an Android device
 */
export function isAndroidDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /android/i.test(navigator.userAgent);
}

/**
 * Detect if running in an Android WebView with native bridge
 */
export function hasNativeAndroidBridge(): boolean {
  if (typeof window === 'undefined') return false;
  return !!((window as any).AndroidMedia || (window as any).AndroidInterface || (window as any).GuidelyNative);
}

/**
 * Request storage or gallery permissions on Android if required
 */
export async function requestAndroidStoragePermission(): Promise<boolean> {
  // If running inside a hybrid Android app with a native Java/Kotlin interface
  const bridge = (window as any).AndroidMedia || (window as any).AndroidInterface;
  if (bridge && typeof bridge.requestStoragePermission === 'function') {
    try {
      return await bridge.requestStoragePermission();
    } catch {
      return true;
    }
  }

  // Modern browser permission check
  if ('permissions' in navigator) {
    try {
      const status = await (navigator.permissions as any).query({ name: 'persistent-storage' });
      return status.state === 'granted' || status.state === 'prompt';
    } catch {
      // Permission API not supported for this name, proceed to standard save
      return true;
    }
  }

  return true;
}

/**
 * Convert Blob to Base64 string for Android native bridges
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Strip Data-URL prefix if needed: data:...;base64,
      const data = base64.includes(',') ? base64.split(',')[1] : base64;
      resolve(data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * WhatsApp-Style "Save to Device / Gallery" Action
 * - Saves from local cache if previously viewed (zero Cloudinary bandwidth consumed)
 * - On Android: saves to Gallery/Photos or Downloads via native bridge, Web Share, or DownloadManager
 * - On Web: triggers browser download or File System Access picker
 * - Never uploads anything back to Guidely or MongoDB
 */
export async function saveMediaToDevice(options: SaveMediaOptions): Promise<SaveMediaResult> {
  const { url, onProgress } = options;
  const isAndroid = isAndroidDevice();

  if (!url) {
    throw new Error('Media URL is required to save');
  }

  try {
    // 1. Request permission only if required on Android
    if (options.requestPermission) {
      const hasPermission = await requestAndroidStoragePermission();
      if (!hasPermission) {
        return {
          success: false,
          isAndroid,
          isCachedLocally: false,
          message: 'Storage permission was denied by user'
        };
      }
    }

    // 2. Fetch media (pulls from local device CacheStorage if previously viewed!)
    if (onProgress) onProgress(15);
    const { blob } = await mediaCache.fetchAndCache(url, options.filename, (pct) => {
      if (onProgress) onProgress(Math.max(15, pct));
    });

    const extension = blob.type.includes('video')
      ? 'mp4'
      : blob.type.includes('png')
      ? 'png'
      : blob.type.includes('webp')
      ? 'webp'
      : blob.type.includes('pdf')
      ? 'pdf'
      : 'jpg';

    const safeFilename = options.filename
      ? options.filename.includes('.') ? options.filename : `${options.filename}.${extension}`
      : `Guidely_${blob.type.startsWith('video') ? 'Video' : 'Media'}_${Date.now()}.${extension}`;

    // 3. Android Native Bridge Execution (if running in Android App/WebView wrapper)
    const nativeBridge = (window as any).AndroidMedia || (window as any).AndroidInterface || (window as any).GuidelyNative;
    if (nativeBridge && typeof nativeBridge.saveToGallery === 'function') {
      const base64 = await blobToBase64(blob);
      const bridgeResult = nativeBridge.saveToGallery(base64, safeFilename, blob.type);
      if (onProgress) onProgress(100);
      return {
        success: true,
        savedPath: typeof bridgeResult === 'string' ? bridgeResult : 'Gallery/Guidely',
        message: 'Saved to Android Gallery',
        isAndroid: true,
        isCachedLocally: true
      };
    }

    // 4. Android / Modern Web File System Access API (if user prefers saving to specific folder)
    if ('showSaveFilePicker' in window && !isAndroid) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: safeFilename,
          types: [{
            description: blob.type.startsWith('video') ? 'Video File' : 'Image File',
            accept: { [blob.type]: [`.${extension}`] }
          }]
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        if (onProgress) onProgress(100);

        return {
          success: true,
          savedPath: safeFilename,
          message: 'Saved to your selected device folder',
          isAndroid: false,
          isCachedLocally: true
        };
      } catch (pickerErr: any) {
        if (pickerErr.name === 'AbortError') {
          return {
            success: false,
            isAndroid: false,
            isCachedLocally: true,
            message: 'Save cancelled by user'
          };
        }
        // Fall back to standard anchor download
      }
    }

    // 5. High-compatibility Browser & Android Download Trigger
    // On Android Chrome/Firefox, this triggers the system DownloadManager which saves to /Download
    // and automatically registers the file with Android MediaStore (Gallery/Google Photos).
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = safeFilename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();

    setTimeout(() => {
      document.body.removeChild(anchor);
      URL.revokeObjectURL(blobUrl);
    }, 1500);

    if (onProgress) onProgress(100);

    return {
      success: true,
      savedPath: isAndroid ? `Downloads/${safeFilename}` : safeFilename,
      message: isAndroid ? 'Saved to Android device / Gallery' : 'Downloaded to device',
      isAndroid,
      isCachedLocally: true
    };
  } catch (err: any) {
    return {
      success: false,
      isAndroid,
      isCachedLocally: false,
      message: err.message || 'Failed to save media to device'
    };
  }
}

/**
 * Share media using Android native system sheet or Web Share API
 */
export async function shareMedia(
  url: string,
  title = 'Guidely Media',
  text?: string
): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.share) {
    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      return false;
    }
  }

  try {
    // Check if we can share the cached file directly for native Android preview
    const cachedBlob = await mediaCache.getCachedBlob(url);
    if (cachedBlob && navigator.canShare) {
      const ext = cachedBlob.type.includes('video') ? 'mp4' : 'jpg';
      const file = new File([cachedBlob], `guidely_share.${ext}`, { type: cachedBlob.type });

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title,
          text: text || title
        });
        return true;
      }
    }

    // Standard URL share
    await navigator.share({
      title,
      text: text || title,
      url
    });
    return true;
  } catch (err: any) {
    if (err.name === 'AbortError') return true; // User dismissed share sheet
    return false;
  }
}
