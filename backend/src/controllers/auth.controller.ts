import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler.util';
import { successResponse } from '../utils/api-response.util';
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from '../services/auth.service';
import { RegisterRequestDTO, LoginRequestDTO } from '../validators/auth.validator';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  clearAuthCookies,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from '../utils/cookie.util';
import { readCookieValue } from '../middlewares/auth.middleware';
import { verifyAccessToken } from '../utils/jwt.util';
import { UnauthorizedError } from '../errors/app.error';

export const register = asyncHandler(async (req: Request, res: Response) => {
  // Safe: validateBody(registerSchema) ran in the route and replaced
  // req.body with the parsed, typed data before this handler runs.
  const input = req.body as RegisterRequestDTO;

  const { user, accessToken, refreshToken } = await registerUser(input);

  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, refreshToken);

  res.status(201).json(successResponse('Registration successful', { user }));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as LoginRequestDTO;

  const { user, accessToken, refreshToken } = await loginUser(input);

  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, refreshToken);

  res.status(200).json(successResponse('Login successful', { user }));
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = readCookieValue(req, REFRESH_TOKEN_COOKIE_NAME);

  if (!token) {
    throw new UnauthorizedError('Refresh token not provided');
  }

  const { accessToken } = await refreshAccessToken(token);
  setAccessTokenCookie(res, accessToken);

  res.status(200).json(successResponse('Access token refreshed'));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  // Best-effort: if the access token is present and valid, invalidate the
  // stored refresh token too. Either way, logout always succeeds — it
  // must remain safe to call even when already logged out.
  const token = readCookieValue(req, ACCESS_TOKEN_COOKIE_NAME);
  let userId: string | undefined;

  if (token) {
    try {
      userId = verifyAccessToken(token).userId;
    } catch {
      userId = undefined;
    }
  }

  await logoutUser(userId);
  clearAuthCookies(res);

  res.status(200).json(successResponse('Logout successful'));
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  const user = await getCurrentUser(req.user.userId);

  res.status(200).json(successResponse('Current user retrieved', { user }));
});
