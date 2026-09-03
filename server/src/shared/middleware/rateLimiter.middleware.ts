import rateLimit, { Options as RateLimitOptions } from 'express-rate-limit';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { env } from '../../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Custom rate-limit exceeded handler that logs a security alert and sends a structured JSON response.
 */
function handleRateLimitExceeded(req: Request, res: Response, next: NextFunction, options: RateLimitOptions): void {
  const ip = req.ip || (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  logger.security('RATE_LIMIT_EXCEEDED', {
    ip,
    path: req.originalUrl || req.url,
    method: req.method,
    userAgent: req.get('user-agent'),
    reqId: req.id
  });

  const retryAfter = res.getHeader('Retry-After') || Math.ceil(options.windowMs / 1000);

  res.status(options.statusCode).json({
    success: false,
    message: options.message || 'Too many requests. Please slow down and try again later.',
    requestId: req.id,
    retryAfterSeconds: Number(retryAfter)
  });
}

/**
 * Standard skip evaluator: skips rate limiting during automated test runs unless explicitly tested.
 */
function shouldSkip(req: Request): boolean {
  if (process.env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit']) {
    return true;
  }
  return false;
}

/**
 * General API Rate Limiter
 * Applied across all /api/ endpoints to prevent brute force and DDoS.
 */
export function createApiRateLimiter(): RequestHandler {
  const windowMs = env.RATE_LIMIT_WINDOW_MS;
  const max = env.RATE_LIMIT_MAX;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: shouldSkip,
    handler: handleRateLimitExceeded,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  });
}

/**
 * Strict Rate Limiter for Authentication and Sensitive Endpoints
 * Applied to login, register, password resets, and account modifications.
 */
export function createAuthRateLimiter(): RequestHandler {
  const windowMs = env.RATE_LIMIT_WINDOW_MS;
  const max = env.AUTH_RATE_LIMIT_MAX;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: shouldSkip,
    handler: handleRateLimitExceeded,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  });
}
