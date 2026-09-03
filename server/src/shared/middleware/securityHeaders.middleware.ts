import helmet from 'helmet';
import { RequestHandler } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Production-grade security headers using Helmet.
 * Protects against XSS, clickjacking, MIME sniffing, and sets secure cross-origin policies.
 */
export function securityHeadersMiddleware(): RequestHandler {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        connectSrc: ["'self'", 'https:', 'wss:', 'ws:'],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: isProduction ? [] : null
      }
    },
    crossOriginEmbedderPolicy: false, // Prevents breaking third-party assets / embeds
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows frontend clients on different domains to load assets
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }, // Enables Google OAuth popups
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' }, // Clickjacking protection
    hidePoweredBy: true, // Strips 'X-Powered-By: Express' to avoid technology fingerprinting
    hsts: isProduction
      ? {
          maxAge: 31536000, // 1 year
          includeSubDomains: true,
          preload: true
        }
      : false,
    ieNoOpen: true,
    noSniff: true, // X-Content-Type-Options: nosniff
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true
  });
}
