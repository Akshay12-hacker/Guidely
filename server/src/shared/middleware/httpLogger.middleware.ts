import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Middleware for production-grade HTTP request/response observability.
 * Captures method, path, response status, duration, client IP, and user-agent.
 */
export function httpLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Capture start time if not already assigned by requestIdMiddleware
  if (!req.startTime) {
    req.startTime = process.hrtime.bigint();
  }

  // Client IP extraction honoring reverse proxy headers
  const getClientIp = (): string => {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    if (Array.isArray(forwarded) && forwarded.length > 0) {
      return forwarded[0].trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  };

  const clientIp = getClientIp();
  const userAgent = req.headers['user-agent'] || 'unknown';

  // Intercept res.end to ensure X-Response-Time header is attached before headers are flushed
  const originalEnd = res.end.bind(res);
  (res as any).end = function (...args: any[]): any {
    const elapsedNs = process.hrtime.bigint() - req.startTime;
    const durationMs = Number((Number(elapsedNs) / 1_000_000).toFixed(2));
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${durationMs}ms`);
    }
    return originalEnd(...args);
  };

  // Hook into response finish event for structured logging
  res.on('finish', () => {
    const elapsedNs = process.hrtime.bigint() - req.startTime;
    const durationMs = Number((Number(elapsedNs) / 1_000_000).toFixed(2));

    const statusCode = res.statusCode;
    const isProbeEndpoint =
      req.originalUrl === '/' ||
      req.path === '/' ||
      req.originalUrl === '/api/health' ||
      req.path === '/api/health';
    const userId = (req as any).user?.userId;

    const logMeta = {
      reqId: req.id,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode,
      durationMs,
      ip: clientIp,
      userAgent,
      contentLength: res.get('content-length') || undefined,
      ...(userId ? { userId } : {})
    };

    // Keep platform probes (Render / load balancers) at debug level when healthy
    if (isProbeEndpoint && statusCode === 200) {
      logger.debug(logMeta, `Health probe ping (${durationMs}ms)`);
      return;
    }

    logger.http(logMeta);
  });

  next();
}
