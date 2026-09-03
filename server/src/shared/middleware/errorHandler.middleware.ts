import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';
import { logger } from '../utils/logger.js';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Centralized production-grade error handling middleware.
 * Normalizes operational and unexpected errors into consistent JSON responses.
 * Redacts sensitive internal details in production while recording full context to logs.
 */
export function errorHandlerMiddleware(): ErrorRequestHandler {
  return (err: any, req: Request, res: Response, next: NextFunction): void => {
    // If response already committed, delegate to default Express handler
    if (res.headersSent) {
      return next(err);
    }

    const reqId = req.id || (req.headers['x-request-id'] as string) || 'unknown';
    const clientIp = req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown';
    const userId = (req as any).user?.userId;

    let statusCode = 500;
    let message = 'An internal server error occurred. Please try again later.';
    let details: unknown = undefined;
    let isOperational = false;

    // 1. Application-defined operational errors
    if (err instanceof AppError) {
      statusCode = err.statusCode;
      message = err.message;
      details = err.details;
      isOperational = err.isOperational;
    }
    // 2. Zod validation errors
    else if (err instanceof ZodError || err.name === 'ZodError') {
      statusCode = 400;
      isOperational = true;
      const issues = err.errors || [];
      const formatted = issues.map((e: any) => `${e.path.join('.') || 'root'}: ${e.message}`).join(', ');
      message = issues.length > 0 ? `Validation failed: ${formatted}` : 'Invalid request payload';
      details = issues;
    }
    // 3. Body-parser JSON syntax error
    else if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
      statusCode = 400;
      isOperational = true;
      message = 'Malformed JSON in request body';
    }
    // 4. JWT authentication / verification errors
    else if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      isOperational = true;
      message = 'Invalid authentication token';
    } else if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      isOperational = true;
      message = 'Authentication token has expired';
    }
    // 5. MongoDB Duplicate Key error (E11000)
    else if (err.code === 11000 || err.name === 'MongoServerError' && err.code === 11000) {
      statusCode = 409;
      isOperational = true;
      const field = Object.keys(err.keyPattern || {})[0] || 'resource';
      message = `A ${field} with that value already exists`;
    }
    // 6. Mongoose CastError (invalid ObjectId / parameter format)
    else if (err.name === 'CastError') {
      statusCode = 400;
      isOperational = true;
      message = `Invalid format for parameter: ${err.path}`;
    }
    // 7. Mongoose ValidationError
    else if (err.name === 'ValidationError') {
      statusCode = 400;
      isOperational = true;
      message = err.message;
      details = Object.values(err.errors || {}).map((e: any) => e.message);
    }
    // 8. General errors
    else {
      statusCode = err.statusCode || err.status || 500;
      // In development or test, allow original error message
      if (!isProduction && err.message) {
        message = err.message;
      }
    }

    const logPayload = {
      reqId,
      method: req.method,
      url: req.originalUrl || req.url,
      ip: clientIp,
      statusCode,
      isOperational,
      ...(userId ? { userId } : {}),
      err: statusCode >= 500 ? err : undefined
    };

    if (statusCode >= 500) {
      logger.error(logPayload, `Server Error [500] on ${req.method} ${req.originalUrl}: ${err.message || message}`);
    } else {
      logger.warn(logPayload, `Client Error [${statusCode}] on ${req.method} ${req.originalUrl}: ${message}`);
    }

    res.status(statusCode).json({
      success: false,
      message,
      requestId: reqId,
      ...(details ? { details } : {}),
      ...(!isProduction && err.stack ? { stack: err.stack } : {})
    });
  };
}
