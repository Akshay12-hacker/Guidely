import { Request, Response, NextFunction } from 'express';
import { JwtService, JwtPayload } from '../../shared/utils/jwt.js';
import { AppError } from '../../shared/errors/AppError.js';
import { UserRole } from '../../shared/types.js';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return next(AppError.unauthorized('Access token is required'));
  }

  try {
    const payload = JwtService.verify(token);
    req.user = payload;
    next();
  } catch {
    return next(AppError.unauthorized('Invalid or expired token'));
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(AppError.forbidden(`Access restricted to roles: ${allowedRoles.join(', ')}`));
    }

    next();
  };
}

export const requireAdmin = requireRole('ADMIN');
export const requireStudent = requireRole('STUDENT');
export const requireMentor = requireRole('MENTOR');
export const requireMentorOrAdmin = requireRole('MENTOR', 'ADMIN');
