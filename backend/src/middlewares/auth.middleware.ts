import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../errors/app.error';
import { verifyAccessToken } from '../utils/jwt.util';
import { ACCESS_TOKEN_COOKIE_NAME } from '../utils/cookie.util';

export function readCookieValue(req: Request, cookieName: string): string | undefined {
  const rawValue: unknown = (req.cookies as Record<string, unknown> | undefined)?.[cookieName];
  return typeof rawValue === 'string' ? rawValue : undefined;
}

/**
 * Requires a valid access token cookie. On success, attaches
 * `{ userId }` to `req.user` (see types/express.d.ts) and continues.
 * On any failure — missing, malformed, expired, or invalid token —
 * responds with a generic 401 without leaking JWT internals.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = readCookieValue(req, ACCESS_TOKEN_COOKIE_NAME);

  if (!token) {
    next(new UnauthorizedError('Authentication required'));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { userId: payload.userId };
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired authentication token'));
  }
}
