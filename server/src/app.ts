import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { AppError } from './shared/errors/AppError.js';
import { logger } from './shared/utils/logger.js';
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

export function createApp(): express.Application {
  const app = express();

  // Middleware
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logger in dev
  if (process.env.NODE_ENV === 'development') {
    app.use((req: Request, res: Response, next: NextFunction) => {
      logger.debug(`${req.method} ${req.path}`);
      next();
    });
  }

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      service: 'Guidely API',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  // Domain API Routes
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

  // 404 handler for undefined API routes
  app.use('/api/*', (req: Request, res: Response, next: NextFunction) => {
    next(AppError.notFound(`API endpoint ${req.method} ${req.baseUrl} not found`));
  });

  // Global Centralized Error Handling Middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        details: err.details
      });
    }

    // Zod validation error handling
    if (err.name === 'ZodError') {
      const messages = err.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Validation failed: ' + messages,
        errors: err.errors
      });
    }

    logger.error('Unhandled server error:', err);

    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred. Please try again later.'
    });
  });

  return app;
}
