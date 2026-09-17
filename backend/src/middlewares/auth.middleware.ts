import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../errors/app.error';
import { ITokenService } from '../contracts/token.service.interface';
import { TokenService } from '../services/token.service';
import { ACCESS_TOKEN_COOKIE_NAME } from '../utils/cookie.util';

export function readCookieValue(req: Request, name: string): string | undefined { return req.cookies?.[name] as string | undefined; }

export class AuthMiddleware {
  constructor(private readonly tokens: ITokenService) {}
  requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
    const token = readCookieValue(req, ACCESS_TOKEN_COOKIE_NAME);
    if (!token) { next(new UnauthorizedError('Authentication required')); return; }
    try { req.user = { userId: this.tokens.verifyAccessToken(token).userId }; next(); }
    catch { next(new UnauthorizedError('Invalid or expired authentication token')); }
  };
}

export const authMiddleware = new AuthMiddleware(new TokenService());
export const requireAuth = authMiddleware.requireAuth;
