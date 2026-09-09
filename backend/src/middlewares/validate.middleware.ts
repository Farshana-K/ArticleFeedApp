import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { BadRequestError } from '../errors/app.error';

/**
 * Parses `req.body` against the given Zod schema. On success, replaces
 * `req.body` with the parsed (and coerced/defaulted) data. On failure,
 * forwards a BadRequestError with per-field messages to the centralized
 * error middleware, rather than each controller handling ZodError itself.
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      next(new BadRequestError('Validation failed', details));
      return;
    }

    req.body = result.data;
    next();
  };
}
