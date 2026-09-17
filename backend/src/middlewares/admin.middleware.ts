import { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/app.error';
import { IUserRepository } from '../contracts/user.repository.interface';
import { UserRepository } from '../repositories/user.repository';
import { UserRole } from '../interfaces/user.interface';
export class AdminMiddleware {
  constructor(private readonly users: IUserRepository) {}
  requireAdmin = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) { next(new UnauthorizedError('Authentication required')); return; }
    const user = await this.users.findById(req.user.userId);
    if (!user) { next(new UnauthorizedError('User not found')); return; }
    if (user.role !== UserRole.ADMIN) { next(new ForbiddenError('Admin access required')); return; }
    next();
  };
}
export const adminMiddleware = new AdminMiddleware(new UserRepository());
export const requireAdmin = adminMiddleware.requireAdmin;
 