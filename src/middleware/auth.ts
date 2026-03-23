import { Request, Response, NextFunction } from 'express';
import { errorMessages } from '../utils/properties';
import { logger } from '../utils/logger';

// Extend express-session types
declare module 'express-session' {
  interface SessionData {
    user?: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      role: string;
    };
  }
}

function getSessionUser(req: Request, res: Response) {
  const user = req.session?.user;
  if (!user) {
    logger.warn('Auth required - no session', { url: req.originalUrl, ip: req.ip });
    res.status(401).json({ message: errorMessages.AUTH_REQUIRED });
    return null;
  }
  return user;
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!getSessionUser(req, res)) return;
  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = getSessionUser(req, res);
  if (!user) return;

  if (user.role !== 'admin') {
    logger.warn('Admin access denied', {
      userId: user.id,
      email: user.email,
      role: user.role,
      url: req.originalUrl
    });
    res.status(403).json({ message: errorMessages.ADMIN_REQUIRED });
    return;
  }
  next();
};
