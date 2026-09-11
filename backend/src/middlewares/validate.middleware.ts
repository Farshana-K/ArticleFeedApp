import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { BadRequestError } from '../errors/app.error';

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

export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      next(new BadRequestError('Validation failed', details));
      return;
    }

    req.params = result.data as Request['params'];
    next();
  };
}