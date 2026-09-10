// Typed HTTP Client for Guidely Mobile

import { apiConfig } from './config';
import { storage, STORAGE_KEYS } from '../utils/storage';

export interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
  skipAuth?: boolean;
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number = 500,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private authToken: string | null = null;

  async initToken() {
    this.authToken = await storage.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  }

  setToken(token: string | null) {
    this.authToken = token;
    if (token) {
      storage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } else {
      storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  }

  getToken(): string | null {
    return this.authToken;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, skipAuth = false, headers = {}, ...customConfig } = options;

    let url = `${apiConfig.httpBaseUrl}${endpoint}`;
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

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(headers as Record<string, string>)
    };

    if (!skipAuth && this.authToken) {
      requestHeaders['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        headers: requestHeaders,
        ...customConfig
      });

      // Handle 204 No Content
      if (response.status === 204) {
        return null as unknown as T;
      }

      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
        throw new ApiError(errorMsg, response.status, data);
      }

      // If response is wrapped in standard { success: true, data: ... } or { status: 'success', data: ... }
      if (
        data &&
        typeof data === 'object' &&
        'data' in data &&
        (data.success === true || data.status === 'success' || (data.success !== false && !data.error))
      ) {
        return data.data as T;
      }

      return data as T;
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error.message || 'Unable to connect to Guidely server. Check your network or server IP.',
        0,
        error
      );
    }
  }

  // HTTP Helper Methods
  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async uploadProfilePhoto(imageUri: string): Promise<{ url: string; secureUrl: string; publicId: string }> {
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

    const response = await fetch(`${apiConfig.httpBaseUrl}/api/upload/profile-photo`, {
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

  async uploadMedia(fileUri: string, folder: string = 'general', mimeType?: string): Promise<{ url: string; secureUrl: string; publicId: string }> {
    const formData = new FormData();
    const filename = fileUri.split('/').pop() || 'upload.bin';
    const match = /\.(\w+)$/.exec(filename);
    const inferredType = mimeType || (match ? `image/${match[1].toLowerCase()}` : 'application/octet-stream');

    formData.append('file', {
      uri: fileUri,
      name: filename,
      type: inferredType
    } as any);

    const headers: Record<string, string> = {
      Accept: 'application/json'
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${apiConfig.httpBaseUrl}/api/upload/media?folder=${encodeURIComponent(folder)}`, {
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
