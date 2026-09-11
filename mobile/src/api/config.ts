// Production-Grade Secure Environment & Network Configuration for Guidely Mobile
// Configured strictly via .env (EXPO_PUBLIC_API_URL, EXPO_PUBLIC_WS_URL)
// No sensitive endpoints or developer switchers are exposed on the user interface

import { Platform } from 'react-native';

export type AppEnvironment = 'development' | 'staging' | 'production';

// Fallback Cloud URLs for production/staging builds
const PRODUCTION_API_URL = 'https://guidely-server-ccg1.onrender.com/api';
const STAGING_API_URL = 'https://guidely-server-ccg1.onrender.com/api';

// Android emulator default host: 10.0.2.2 points to host machine loopback
const DEFAULT_DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const DEFAULT_PORT = '5000';

class ApiConfig {
  private environment: AppEnvironment = __DEV__ ? 'development' : 'production';

  async init() {
    // Environment initialized at bundle/runtime
  }

  setEnvironment(env: AppEnvironment) {
    this.environment = env;
  }

  get isProduction(): boolean {
    return this.environment === 'production' && !__DEV__;
  }

  /**
   * HTTP API Base URL
   * Prioritizes EXPO_PUBLIC_API_URL from .env
   */
  get httpBaseUrl(): string {
    const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
    if (envApiUrl && envApiUrl.trim().length > 0) {
      const sanitized = envApiUrl.trim().replace(/\/+$/, '');
      return sanitized.endsWith('/api') ? sanitized : `${sanitized}/api`;
    }

    if (this.isProduction) {
      return PRODUCTION_API_URL;
    }

    if (this.environment === 'staging') {
      return STAGING_API_URL;
    }

    // Development default
    return `http://${DEFAULT_DEV_HOST}:${DEFAULT_PORT}/api`;
  }

  /**
   * WebSocket Base URL
   * Prioritizes EXPO_PUBLIC_WS_URL from .env or cleanly derives from httpBaseUrl
   */
  get wsBaseUrl(): string {
    const envWsUrl = process.env.EXPO_PUBLIC_WS_URL;
    if (envWsUrl && envWsUrl.trim().length > 0) {
      return envWsUrl.trim().replace(/\/+$/, '');
    }

    const httpUrl = this.httpBaseUrl;
    const isSecure = httpUrl.startsWith('https://');
    const wsProtocol = isSecure ? 'wss://' : 'ws://';
    const hostWithPort = httpUrl
      .replace(/^https?:\/\//, '')
      .replace(/\/api\/?$/, '')
      .replace(/\/+$/, '');

    return `${wsProtocol}${hostWithPort}`;
  }
}

export const apiConfig = new ApiConfig();
