/**
 * MediaCacheService
 * WhatsApp-style local device media cache using CacheStorage and IndexedDB.
 * Prevents repetitive Cloudinary downloads, preserves Free Tier bandwidth,
 * and allows instant offline media viewing.
 */

export interface CachedMediaMetadata {
  url: string;
  filename: string;
  contentType: string;
  size: number;
  cachedAt: string;
  isSavedToDevice: boolean;
}

const CACHE_NAME = 'guidely-media-v1';
const DB_NAME = 'guidely-media-db';
const STORE_NAME = 'media-metadata';

class MediaCacheService {
  private static instance: MediaCacheService;
  private memoryBlobUrls = new Map<string, string>();
  private activeDownloads = new Map<string, Promise<Blob>>();
  private isSupported = typeof window !== 'undefined' && 'caches' in window;

  private constructor() {
    this.initDb();
  }

  public static getInstance(): MediaCacheService {
    if (!MediaCacheService.instance) {
      MediaCacheService.instance = new MediaCacheService();
    }
    return MediaCacheService.instance;
  }

  private async getDb(): Promise<IDBDatabase | null> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) return null;

    return new Promise((resolve) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'url' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
  }

  private async initDb(): Promise<void> {
    try {
      await this.getDb();
    } catch {
      // Degraded fallback
    }
  }

  /**
   * Check if a media URL is already cached locally
   */
  public async isCached(url: string): Promise<boolean> {
    if (!url) return false;
    if (this.memoryBlobUrls.has(url)) return true;

    if (!this.isSupported) return false;

    try {
      const cache = await caches.open(CACHE_NAME);
      const match = await cache.match(url);
      return !!match;
    } catch {
      return false;
    }
  }

  /**
   * Retrieve cached Blob or null if not cached
   */
  public async getCachedBlob(url: string): Promise<Blob | null> {
    if (!url || !this.isSupported) return null;

    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match(url);
      if (response) {
        return await response.blob();
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get an object URL pointing to the local device cached media
   * Allows <img> and <video> elements to load instantly from disk with zero network requests
   */
  public async getCachedBlobUrl(url: string): Promise<string | null> {
    if (!url) return null;

    if (this.memoryBlobUrls.has(url)) {
      return this.memoryBlobUrls.get(url)!;
    }

    const blob = await this.getCachedBlob(url);
    if (blob) {
      const blobUrl = URL.createObjectURL(blob);
      this.memoryBlobUrls.set(url, blobUrl);
      return blobUrl;
    }

    return null;
  }

  /**
   * Store a media Blob in the local device cache
   */
  public async cacheMediaBlob(
    url: string,
    blob: Blob,
    filename: string,
    isSavedToDevice = false
  ): Promise<string> {
    if (this.isSupported) {
      try {
        const cache = await caches.open(CACHE_NAME);
        const headers = new Headers({
          'Content-Type': blob.type,
          'Content-Length': blob.size.toString(),
          'X-Guidely-Cached': new Date().toISOString()
        });
        const response = new Response(blob, { headers });
        await cache.put(url, response);
      } catch (err) {
        console.warn('Failed to write to CacheStorage:', err);
      }
    }

    // Update metadata in IndexedDB
    try {
      const db = await this.getDb();
      if (db) {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const meta: CachedMediaMetadata = {
          url,
          filename,
          contentType: blob.type,
          size: blob.size,
          cachedAt: new Date().toISOString(),
          isSavedToDevice
        };
        store.put(meta);
      }
    } catch {
      // Ignore IDB write error
    }

    const blobUrl = URL.createObjectURL(blob);
    this.memoryBlobUrls.set(url, blobUrl);
    return blobUrl;
  }

  /**
   * Fetch media with progress tracking and cache it locally
   * Prevents duplicate simultaneous downloads of the same media file
   */
  public async fetchAndCache(
    url: string,
    filename?: string,
    onProgress?: (progressPct: number) => void
  ): Promise<{ blob: Blob; blobUrl: string }> {
    // 1. If already in local cache, return immediately
    const existingBlob = await this.getCachedBlob(url);
    if (existingBlob) {
      if (onProgress) onProgress(100);
      const existingUrl = await this.getCachedBlobUrl(url);
      return { blob: existingBlob, blobUrl: existingUrl || URL.createObjectURL(existingBlob) };
    }

    // 2. Prevent duplicate simultaneous downloads
    if (this.activeDownloads.has(url)) {
      const blob = await this.activeDownloads.get(url)!;
      const blobUrl = await this.getCachedBlobUrl(url);
      return { blob, blobUrl: blobUrl || URL.createObjectURL(blob) };
    }

    // 3. Perform download with progress
    const downloadPromise = new Promise<Blob>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.responseType = 'blob';

      if (onProgress) {
        xhr.onprogress = (event) => {
          if (event.lengthComputable && event.total > 0) {
            const pct = Math.round((event.loaded / event.total) * 100);
            onProgress(pct);
          } else {
            onProgress(50);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (onProgress) onProgress(100);
          resolve(xhr.response as Blob);
        } else {
          reject(new Error(`Failed to download media: HTTP ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error downloading media from Cloudinary'));
      };

      xhr.send();
    });

    this.activeDownloads.set(url, downloadPromise);

    try {
      const blob = await downloadPromise;
      const resolvedFilename = filename || url.split('/').pop()?.split('?')[0] || 'media_asset';
      const blobUrl = await this.cacheMediaBlob(url, blob, resolvedFilename, false);
      return { blob, blobUrl };
    } finally {
      this.activeDownloads.delete(url);
    }
  }

  /**
   * Delete media asset from local device cache
   */
  public async deleteFromCache(url: string): Promise<boolean> {
    let deleted = false;

    if (this.memoryBlobUrls.has(url)) {
      const oldUrl = this.memoryBlobUrls.get(url);
      if (oldUrl) URL.revokeObjectURL(oldUrl);
      this.memoryBlobUrls.delete(url);
      deleted = true;
    }

    if (this.isSupported) {
      try {
        const cache = await caches.open(CACHE_NAME);
        const res = await cache.delete(url);
        if (res) deleted = true;
      } catch {
        // Ignore
      }
    }

    try {
      const db = await this.getDb();
      if (db) {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(url);
      }
    } catch {
      // Ignore
    }

    return deleted;
  }

  /**
   * Get metadata list of all locally cached files
   */
  public async listCachedMedia(): Promise<CachedMediaMetadata[]> {
    const db = await this.getDb();
    if (!db) return [];

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  /**
   * Clear all locally cached media from device
   */
  public async clearAll(): Promise<void> {
    this.memoryBlobUrls.forEach((blobUrl) => URL.revokeObjectURL(blobUrl));
    this.memoryBlobUrls.clear();

    if (this.isSupported) {
      try {
        await caches.delete(CACHE_NAME);
      } catch {
        // Ignore
      }
    }

    try {
      const db = await this.getDb();
      if (db) {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).clear();
      }
    } catch {
      // Ignore
    }
  }
}

export const mediaCache = MediaCacheService.getInstance();
