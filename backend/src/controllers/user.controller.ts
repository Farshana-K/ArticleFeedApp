import { Request, Response } from 'express';
import { UnauthorizedError } from '../errors/app.error';
import {
  changeUserPassword,
  getUserProfile,
  updateUserPreferenceData,
  updateUserProfileData,
} from '../services/user.service';
import {
  UpdatePasswordRequestDTO,
  UpdatePreferencesRequestDTO,
  UpdateProfileRequestDTO,
} from '../validators/user.validator';
import { asyncHandler } from '../utils/async-handler.util';
import { successResponse } from '../utils/api-response.util';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  const user = await getUserProfile(req.user.userId);
  res.status(200).json(successResponse('Profile retrieved successfully', { user }));
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  const input = req.body as UpdateProfileRequestDTO;
  const user = await updateUserProfileData(req.user.userId, input);
  res.status(200).json(successResponse('Profile updated successfully', { user }));
});

export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  const input = req.body as UpdatePasswordRequestDTO;
  await changeUserPassword(req.user.userId, input);
  res.status(200).json(successResponse('Password updated successfully'));
});

export const updatePreferences = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  const input = req.body as UpdatePreferencesRequestDTO;
  const user = await updateUserPreferenceData(req.user.userId, input);
  res.status(200).json(successResponse('Preferences updated successfully', { user }));
});