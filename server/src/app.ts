import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { AppError } from './shared/errors/AppError.js';
import { requestIdMiddleware } from './shared/middleware/requestId.middleware.js';
import { httpLoggerMiddleware } from './shared/middleware/httpLogger.middleware.js';
import { securityHeadersMiddleware } from './shared/middleware/securityHeaders.middleware.js';
import { createApiRateLimiter } from './shared/middleware/rateLimiter.middleware.js';
import { errorHandlerMiddleware } from './shared/middleware/errorHandler.middleware.js';
import { createAuthRouter } from './modules/auth/auth.routes.js';
import { createUserRouter } from './modules/users/user.routes.js';
import { createStudentRouter } from './modules/students/student.routes.js';
import { createMentorRouter } from './modules/mentors/mentor.routes.js';
import { createMentorshipRouter } from './modules/mentorship/mentorship.routes.js';
import { createProjectRouter } from './modules/projects/project.routes.js';
import { createSessionRouter } from './modules/sessions/session.routes.js';
import { createMessagingRouter } from './modules/messaging/messaging.routes.js';
import { createNotificationRouter } from './modules/notifications/notification.routes.js';
import { createReviewRouter } from './modules/reviews/review.routes.js';
import { createAdminRouter } from './modules/admin/admin.routes.js';
import { createUploadRouter } from './modules/upload/upload.routes.js';

// Helper to evaluate CORS origin authorization safely
export function isOriginAllowed(origin: string | undefined, allowedOrigins: string[]): boolean {
  // Allow requests with no origin (e.g. mobile apps, curl, internal server-to-server, Render probes)
  if (!origin) return true;

  const cleanOrigin = origin.replace(/\/+$/, '').toLowerCase();

  // Allow wildcard
  if (allowedOrigins.includes('*')) return true;

  // Explicit match against configured allowed origins
  if (allowedOrigins.some((o) => o.replace(/\/+$/, '').toLowerCase() === cleanOrigin)) {
    return true;
  }

  // Always permit localhost and 127.0.0.1 on any port (critical for local frontend dev against remote backend)
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin)) {
    return true;
  }

  // Always permit Guidely frontend deployments on standard cloud hosting platforms
  if (
    /^https:\/\/.*\.onrender\.com$/.test(cleanOrigin) ||
    /^https:\/\/.*\.vercel\.app$/.test(cleanOrigin) ||
    /^https:\/\/.*\.netlify\.app$/.test(cleanOrigin)
  ) {
    return true;
  }

  return false;
}

export function createApp(): express.Application {
  const app = express();

  // 1. Trust upstream reverse proxy (Render, Cloudflare, etc.) for correct client IP detection
  if (env.TRUST_PROXY) {
    app.set('trust proxy', 1);
  }

  // 2. Unique Request ID correlation middleware (MUST run before all other middleware so req.id is always available)
  app.use(requestIdMiddleware);

  // 3. High-resolution HTTP request/response observability logger
  app.use(httpLoggerMiddleware);

  // 4. Production-grade Helmet security headers
  app.use(securityHeadersMiddleware());

  // 5. Strict, environment-aware CORS protection
  const rawOrigins =
    process.env.CLIENT_ORIGIN ||
    process.env.CORS_ORIGIN ||
    process.env.ALLOWED_ORIGINS ||
    env.CLIENT_ORIGIN ||
    'http://localhost:5173,http://localhost:3000';
  const allowedOrigins = rawOrigins.split(',').map((o) => o.trim()).filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (isOriginAllowed(origin, allowedOrigins)) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'Accept', 'Origin', 'X-Requested-With'],
      exposedHeaders: ['X-Request-Id', 'X-Response-Time'],
      maxAge: 86400 // Cache preflight requests for 24 hours
    })
  );

  // 6. Request body parsing with strict size limits
  const bodyLimit = process.env.BODY_LIMIT || env.BODY_LIMIT;
  app.use(express.json({ limit: bodyLimit }));
  app.use(express.urlencoded({ extended: true, limit: bodyLimit }));

  // 7. Root probe endpoint for platform health monitors (Render, Cloudflare, load balancers)
  app.all('/', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'online',
      service: 'Guidely Full-Stack Server',
      version: '1.0.0',
      health: '/api/health',
      timestamp: new Date().toISOString(),
      requestId: req.id
    });
  });

  // 8. Global API rate limiter (protects all /api endpoints)
  app.use('/api', createApiRateLimiter());

  // 9. Health & Telemetry check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      service: 'Guidely API',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptimeSeconds: Math.floor(process.uptime()),
      env: process.env.NODE_ENV || env.NODE_ENV,
      requestId: req.id,
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  });

  // 8. Domain API Routes
  app.use('/api/auth', createAuthRouter());
  app.use('/api/users', createUserRouter());
  app.use('/api/students', createStudentRouter());
  app.use('/api/mentors', createMentorRouter());
  app.use('/api/mentorship', createMentorshipRouter());
  app.use('/api/projects', createProjectRouter());
  app.use('/api/sessions', createSessionRouter());
  app.use('/api/messaging', createMessagingRouter());
  app.use('/api/notifications', createNotificationRouter());
  app.use('/api/reviews', createReviewRouter());
  app.use('/api/admin', createAdminRouter());
  app.use('/api/upload', createUploadRouter());

  // 9. 404 handler for undefined API endpoints
  app.use('/api/*', (req: Request, res: Response, next: NextFunction) => {
    next(AppError.notFound(`API endpoint ${req.method} ${req.originalUrl || req.baseUrl} not found`));
  });

  // 10. Centralized Production Error Handler
  app.use(errorHandlerMiddleware());

  return app;
}
