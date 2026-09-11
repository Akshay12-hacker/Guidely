// Production-Grade Typed HTTP Client for Guidely Mobile
// Implements Request IDs, Timeouts, Safe Retries, Secure Storage, Observability Logging & 401 Expiration

import { apiConfig } from './config';
import { secureStorage, STORAGE_KEYS } from '../utils/storage';

export interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
  skipAuth?: boolean;
  timeoutMs?: number;
  retries?: number;
  operation?: string;
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number = 500,
    public data?: any,
    public requestId?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type AuthExpiredListener = () => void;

class ApiClient {
  private authToken: string | null = null;
  private authExpiredListeners: Set<AuthExpiredListener> = new Set();
  private defaultTimeoutMs = 15000; // 15s timeout

  async initToken(): Promise<string | null> {
    this.authToken = await secureStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return this.authToken;
  }

  setToken(token: string | null) {
    this.authToken = token;
    if (token) {
      secureStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token).catch(() => {});
    } else {
      secureStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN).catch(() => {});
    }
  }

  getToken(): string | null {
    return this.authToken;
  }

  onAuthExpired(listener: AuthExpiredListener): () => void {
    this.authExpiredListeners.add(listener);
    return () => this.authExpiredListeners.delete(listener);
  }

  private notifyAuthExpired() {
    this.setToken(null);
    this.authExpiredListeners.forEach(listener => {
      try {
        listener();
      } catch {}
    });
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      params,
      skipAuth = false,
      headers = {},
      timeoutMs = this.defaultTimeoutMs,
      retries = (options.method === 'GET' || !options.method) ? 1 : 0,
      operation = endpoint.replace(/^\/+/, '').split('?')[0] || 'request',
      ...customConfig
    } = options;

    const cleanBase = apiConfig.httpBaseUrl.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    let url = `${cleanBase}${cleanEndpoint}`;
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          if (Array.isArray(val)) {
            val.forEach(item => queryParams.append(key, item));
          } else {
            queryParams.append(key, String(val));
          }
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    const requestId = this.generateRequestId();
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Request-Id': requestId,
      ...(headers as Record<string, string>)
    };

    if (!skipAuth && this.authToken) {
      requestHeaders['Authorization'] = `Bearer ${this.authToken}`;
    }

    const method = (customConfig.method || 'GET').toUpperCase();
    const startTime = Date.now();

    const executeAttempt = async (attempt: number): Promise<T> => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          ...customConfig,
          method,
          headers: requestHeaders,
          signal: controller.signal
        });

        clearTimeout(timer);
        const duration = Date.now() - startTime;

        // Centralized Structured Logging (Sanitized - no credentials/passwords)
        if (__DEV__) {
          console.log(
            `[API] ${method} ${endpoint} - ${response.status} (${duration}ms) [${requestId}]`
          );
        }

        // Handle 401 Unauthorized
        if (response.status === 401 && !skipAuth) {
          this.notifyAuthExpired();
          throw new ApiError('Session expired. Please log in again.', 401, null, requestId);
        }

        // Handle 204 No Content
        if (response.status === 204) {
          return null as unknown as T;
        }

        const contentType = response.headers.get('content-type') || '';
        let data: any;

        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        if (!response.ok) {
          const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
          throw new ApiError(errorMsg, response.status, data, requestId);
        }

        // Standard unwrapping if backend response is { success: true, data: ... }
        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          (data.success === true || data.status === 'success' || (data.success !== false && !data.error))
        ) {
          return data.data as T;
        }

        return data as T;
      } catch (err: any) {
        clearTimeout(timer);
        const duration = Date.now() - startTime;

        if (err.name === 'AbortError') {
          throw new ApiError(`Request timeout after ${timeoutMs}ms. Please check your network connection.`, 408, null, requestId);
        }

        if (err instanceof ApiError) {
          throw err;
        }

        // Network error retry for safe GET requests
        if (attempt < retries && (method === 'GET' || !method)) {
          const backoff = 400 * Math.pow(2, attempt);
          await new Promise(r => setTimeout(r, backoff));
          return executeAttempt(attempt + 1);
        }

        const errorMsg = err.message || 'Unable to connect to Guidely server. Please check your network.';
        if (__DEV__) {
          console.warn(`[API_ERROR] ${method} ${endpoint} (${duration}ms) [${url}]:`, errorMsg);
        }
        throw new ApiError(errorMsg, 0, err, requestId);
      }
    };

    return executeAttempt(0);
  }

  // HTTP Helper Methods
  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  }

  put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  }

  patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  }

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Upload user profile photo to backend /api/upload/profile-photo
   */
  async uploadProfilePhoto(imageUri: string): Promise<{ url: string; secureUrl: string; publicId: string; user?: any }> {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'profile.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';

    formData.append('file', {
      uri: imageUri,
      name: filename,
      type
    } as any);

    const headers: Record<string, string> = {
      Accept: 'application/json'
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const cleanBase = apiConfig.httpBaseUrl.replace(/\/+$/, '');
    const response = await fetch(`${cleanBase}/upload/profile-photo`, {
      method: 'POST',
      headers,
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new ApiError(data?.message || 'Failed to upload profile photo', response.status, data);
    }

    return data?.data || data;
  }

  /**
   * Upload general media asset to backend /api/upload/media
   */
  async uploadMedia(
    fileUri: string,
    folder: string = 'general',
    mimeType?: string,
    projectId?: string
  ): Promise<{ url: string; secureUrl: string; publicId: string }> {
    const formData = new FormData();
    const filename = fileUri.split('/').pop() || 'upload.bin';
    const match = /\.(\w+)$/.exec(filename);
    const inferredType = mimeType || (match ? `image/${match[1].toLowerCase()}` : 'application/octet-stream');

    formData.append('file', {
      uri: fileUri,
      name: filename,
      type: inferredType
    } as any);

    if (projectId) {
      formData.append('projectId', projectId);
    }

    const headers: Record<string, string> = {
      Accept: 'application/json'
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const cleanBase = apiConfig.httpBaseUrl.replace(/\/+$/, '');
    const response = await fetch(`${cleanBase}/upload/media?folder=${encodeURIComponent(folder)}`, {
      method: 'POST',
      headers,
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new ApiError(data?.message || 'Failed to upload media', response.status, data);
    }

    return data?.data || data;
  }

  uploadImage(imageUri: string): Promise<{ url: string; secureUrl: string; publicId: string }> {
    return this.uploadProfilePhoto(imageUri);
  }
}

export const apiClient = new ApiClient();

