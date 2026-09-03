import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger, GuidelyLogger } from '../utils/logger.js';

// Augment Express Request interface to include request telemetry properties
declare global {
  namespace Express {
    interface Request {
      id: string;
      startTime: bigint;
      log: GuidelyLogger;
    }
  }
}

/**
 * Middleware to generate or propagate unique request IDs across the request lifecycle.
 * Sets the X-Request-Id response header and binds a child logger with request context.
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Respect existing request ID from upstream reverse proxy (Render, Cloudflare, etc.) or client
  const incomingId = req.headers['x-request-id'] || req.headers['x-correlation-id'];
  const reqId = typeof incomingId === 'string' && incomingId.trim().length > 0
    ? incomingId.trim()
    : crypto.randomUUID();

  req.id = reqId;
  req.startTime = process.hrtime.bigint();

  // Expose request ID in response header
  res.setHeader('X-Request-Id', reqId);

  // Attach request-scoped logger
  req.log = logger.child({ reqId });

  next();
}
