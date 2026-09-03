import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema
} from './auth.validation.js';
import { AuthenticatedRequest } from './auth.middleware.js';
import { logger } from '../../shared/utils/logger.js';

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await this.authService.register(validated);

      logger.security('USER_REGISTERED', {
        userId: result.user.id,
        email: validated.email,
        role: validated.role,
        ip: req.ip,
        reqId: req.id
      });

      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      logger.security('REGISTRATION_FAILED', {
        email: req.body?.email,
        reason: err.message,
        ip: req.ip,
        reqId: req.id
      });
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await this.authService.login(validated);

      logger.security('LOGIN_SUCCESS', {
        userId: result.user.id,
        email: validated.email,
        role: result.user.role,
        ip: req.ip,
        reqId: req.id,
        userAgent: req.get('user-agent')
      });

      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      logger.security('LOGIN_FAILED', {
        email: req.body?.email,
        reason: err.message,
        ip: req.ip,
        reqId: req.id,
        userAgent: req.get('user-agent')
      });
      next(err);
    }
  };

  googleAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = googleAuthSchema.parse(req.body);
      const result = await this.authService.googleAuth(validated);

      logger.security('GOOGLE_AUTH_SUCCESS', {
        userId: result.user.id,
        email: validated.email,
        ip: req.ip,
        reqId: req.id
      });

      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      logger.security('GOOGLE_AUTH_FAILED', {
        email: req.body?.email,
        reason: err.message,
        ip: req.ip,
        reqId: req.id
      });
      next(err);
    }
  };

  getCurrentUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await this.authService.getCurrentUser(req.user!.userId);
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  };

  changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const validated = changePasswordSchema.parse(req.body);
      await this.authService.changePassword(
        req.user!.userId,
        validated.currentPassword,
        validated.newPassword
      );

      logger.security('PASSWORD_CHANGED', {
        userId: req.user!.userId,
        ip: req.ip,
        reqId: req.id
      });

      res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (err: any) {
      logger.security('PASSWORD_CHANGE_FAILED', {
        userId: req.user?.userId,
        reason: err.message,
        ip: req.ip,
        reqId: req.id
      });
      next(err);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = forgotPasswordSchema.parse(req.body);
      const result = await this.authService.forgotPassword(validated.email);

      logger.security('PASSWORD_RESET_REQUESTED', {
        email: validated.email,
        ip: req.ip,
        reqId: req.id
      });

      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = resetPasswordSchema.parse(req.body);
      await this.authService.resetPassword(validated.token, validated.password);

      logger.security('PASSWORD_RESET_COMPLETED', {
        ip: req.ip,
        reqId: req.id
      });

      res.status(200).json({ success: true, message: 'Password has been reset successfully' });
    } catch (err: any) {
      logger.security('PASSWORD_RESET_FAILED', {
        reason: err.message,
        ip: req.ip,
        reqId: req.id
      });
      next(err);
    }
  };
}
