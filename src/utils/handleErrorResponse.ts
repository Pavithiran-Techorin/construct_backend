import { Response } from 'express';
import { errorMessages } from './properties';
import { logger } from './logger';

export function handleErrorResponse(
  res: Response,
  error: any,
  knownErrors: Record<string, number>,
): Response {
  const msg = error?.message || '';

  if (msg in knownErrors) {
    return res.status(knownErrors[msg]).json({ message: msg });
  }

  logger.error('Unhandled error', { error: msg, stack: error?.stack });
  return res.status(500).json({ message: errorMessages.INTERNAL_SERVER_ERROR });
}
