export class AppError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    // Note: Error.captureStackTrace is a V8-specific API (Node.js).
    // In strict non-V8 environments without compat layers, it may be undefined or no-op.
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
