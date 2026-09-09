import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env.config';
import { parseDurationToSeconds } from './duration.util';

export interface AccessTokenPayload {
  userId: string;
}

export interface RefreshTokenPayload {
  userId: string;
}

/**
 * Narrows jsonwebtoken's loosely-typed decoded payload (string | JwtPayload)
 * down to our known shape, verifying `userId` is actually present at
 * runtime rather than trusting an unchecked cast.
 */
function extractUserId(decoded: string | JwtPayload): string {
  if (typeof decoded === 'string') {
    throw new Error('Unexpected token payload format');
  }

  const candidate = decoded as JwtPayload & { userId?: unknown };

  if (typeof candidate.userId !== 'string') {
    throw new Error('Token payload is missing userId');
  }

  return candidate.userId;
}

export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: parseDurationToSeconds(env.JWT_ACCESS_EXPIRES_IN),
  });
}

export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: parseDurationToSeconds(env.JWT_REFRESH_EXPIRES_IN),
  });
}

/** Throws jsonwebtoken's own errors (TokenExpiredError / JsonWebTokenError) on failure. */
export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  return { userId: extractUserId(decoded) };
}

/** Throws jsonwebtoken's own errors (TokenExpiredError / JsonWebTokenError) on failure. */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
  return { userId: extractUserId(decoded) };
}
