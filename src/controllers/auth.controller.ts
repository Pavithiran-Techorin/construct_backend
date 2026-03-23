import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { handleErrorResponse } from '../utils/handleErrorResponse';
import { authKnownErrors } from '../utils/knownError';
import { successMessages, errorMessages } from '../utils/properties';
import { logger } from '../utils/logger';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      logger.debug('Login attempt', { email });
      const user = await AuthService.login(email, password);
      req.session.user = user;
      logger.info('Login successful', { userId: user.id, email: user.email, role: user.role });
      res.json({ user });
    } catch (error: any) {
      logger.warn('Login failed', { email: req.body.email, reason: error?.message });
      handleErrorResponse(res, error, authKnownErrors);
    }
  }

  static logout(req: Request, res: Response) {
    const userId = req.session.user?.id;
    const email = req.session.user?.email;
    req.session.destroy((err) => {
      if (err) {
        logger.error('Logout failed', { userId, error: err.message });
        res.status(500).json({ message: errorMessages.LOGOUT_FAILED });
        return;
      }
      res.clearCookie('connect.sid');
      logger.info('Logout successful', { userId, email });
      res.json({ message: successMessages.LOGGED_OUT });
    });
  }

  static getMe(req: Request, res: Response) {
    logger.debug('Get current user', { userId: req.session.user?.id });
    res.json({ user: req.session.user });
  }
}
