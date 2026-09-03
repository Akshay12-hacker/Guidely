import { env } from '../../config/env.js';

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    console.log(`[INFO] [${new Date().toISOString()}] ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, ...args);
  },
  debug: (message: string, ...args: unknown[]) => {
    const isDev = (process.env.NODE_ENV || env.NODE_ENV) === 'development';
    const isDebug = process.env.LOG_LEVEL === 'debug' || process.env.DEBUG === 'true';
    if (isDev || isDebug) {
      console.debug(`[DEBUG] [${new Date().toISOString()}] ${message}`, ...args);
    }
  }
};
