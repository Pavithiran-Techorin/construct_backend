import { createLogger, format, transports } from 'winston';
import { Request, Response, NextFunction } from 'express';

export const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json(),
  ),
  defaultMeta: { service: 'construction-api' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length > 1 ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} [${level}]: ${message}${metaStr}`;
        }),
      ),
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, originalUrl } = req;
  const userId = (req.session as any)?.user?.id;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const logData = {
      method,
      url: originalUrl,
      statusCode,
      duration: `${duration}ms`,
      userId: userId || 'anonymous',
    };

    if (statusCode >= 500) {
      logger.error('Request failed', logData);
    } else if (statusCode >= 400) {
      logger.warn('Request error', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });

  next();
};
