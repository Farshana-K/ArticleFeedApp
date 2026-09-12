import { CookieOptions, Response } from 'express';
import { env } from '../config/env.config';
import { parseDurationToSeconds } from './duration.util';

export const ACCESS_TOKEN_COOKIE_NAME = 'accessToken';
export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

function baseCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'none',
  };
}

export function setAccessTokenCookie(res: Response, token: string): void {
  res.cookie(ACCESS_TOKEN_COOKIE_NAME, token, {
    ...baseCookieOptions(),
    maxAge: parseDurationToSeconds(env.JWT_ACCESS_EXPIRES_IN) * 1000,
  });
}

export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, token, {
    ...baseCookieOptions(),
    maxAge: parseDurationToSeconds(env.JWT_REFRESH_EXPIRES_IN) * 1000,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, baseCookieOptions());
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, baseCookieOptions());
}
