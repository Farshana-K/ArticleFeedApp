import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app.error';
import { errorResponse } from '../utils/api-response.util';
import { env } from '../config/env.config';

/**
 * Catches any request to an undefined route and forwards a 404 AppError
 * to the centralized error handler below. Must be registered after all
 * other routes and before errorMiddleware.
 */
export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(404).json(errorResponse(`Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Centralized Express error handler. Must be registered last, after all
 * routes and other middleware, with exactly 4 parameters so Express
 * recognizes it as an error handler.
 */
export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res
      .status(err.statusCode)
      .json(errorResponse(err.message, err.details !== undefined ? [err.details] : undefined));
    return;
  }

  // Unexpected/programming error — do not leak internals in production.
  // eslint-disable-next-line no-console
  console.error('Unexpected error:', err);

  res
    .status(500)
    .json(
      errorResponse(
        env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      ),
    );
}
