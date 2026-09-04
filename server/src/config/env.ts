import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Find and load .env file reliably across all execution contexts
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const candidatePaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'server', '.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../.env')
];

let envLoaded = false;
for (const envPath of candidatePaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  dotenv.config();
}

export const env = {
  // Server & Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
  PORT: parseInt(process.env.PORT || (process.env.NODE_ENV === 'production' ? '10000' : '5000'), 10),

  // Database (MongoDB Atlas / Local)
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/guidely',
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || process.env.DB_NAME || 'guidely',
  MONGODB_TIMEOUT_MS: parseInt(process.env.MONGODB_TIMEOUT_MS || '5000', 10),

  // Security & Authentication
  JWT_SECRET: process.env.JWT_SECRET || 'guidely-super-secret-jwt-key-2026-production-ready',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),

  // CORS & Clients
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || process.env.CORS_ORIGIN || 'http://localhost:5173',
  CORS_ORIGIN: process.env.CORS_ORIGIN || process.env.CLIENT_ORIGIN || 'http://localhost:5173',

  // Seeding
  SEED_DEMO_DATA: process.env.SEED_DEMO_DATA === 'true',

  // WebSocket
  WS_HEARTBEAT_INTERVAL_MS: parseInt(process.env.WS_HEARTBEAT_INTERVAL_MS || '30000', 10),

  // Logging & Observability
  LOG_LEVEL: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  LOG_FORMAT: process.env.LOG_FORMAT || (process.env.NODE_ENV === 'production' ? 'json' : 'pretty'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes default
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '300', 10), // 300 requests per 15 min
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '20', 10), // 20 attempts per 15 min

  // Proxy Configuration (Render, Cloudflare, Heroku, etc.)
  TRUST_PROXY: process.env.TRUST_PROXY === 'true' || process.env.TRUST_PROXY === '1' || process.env.NODE_ENV === 'production',

  // HTTP Limits
  BODY_LIMIT: process.env.BODY_LIMIT || '10mb',

  // Cloudinary Media Management
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'Guidely',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '721675214645412',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || 'guidely-cloudinary-secret-key-2026-production-ready',
  get isCloudinaryConfigured(): boolean {
    return Boolean(this.CLOUDINARY_CLOUD_NAME && this.CLOUDINARY_API_KEY && this.CLOUDINARY_API_SECRET);
  }
};

export default env;
