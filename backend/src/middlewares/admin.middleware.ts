import { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/app.error';
import { findUserById } from '../repositories/user.repository';
import { UserRole } from '../interfaces/user.interface';

export async function requireAdmin(req: Request, _res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    next(new UnauthorizedError('Authentication required'));
    return;
  }

  const user = await findUserById(req.user.userId);

  if (!user) {
    next(new UnauthorizedError('User not found'));
    return;
  }

  if (user.role !== UserRole.ADMIN) {
    next(new ForbiddenError('Admin access required'));
    return;
  }

  next();
}