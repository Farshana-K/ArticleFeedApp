import { Types } from 'mongoose';
import { BadRequestError, ConflictError, UnauthorizedError } from '../errors/app.error';
import { CategoryModel } from '../models/category.model';
import {
  findUserByEmail,
  findUserByIdWithPassword,
  findUserByIdWithPreferences,
  findUserByPhone,
  updateUserPassword,
  updateUserPreferences,
  updateUserProfile,
  updateUserRefreshToken,
  UserWithPopulatedPreferences,
} from '../repositories/user.repository';
import { SafeUserDTO } from '../dto/auth.dto';
import { comparePassword, hashPassword } from '../utils/password.util';
import {
  UpdatePasswordRequestDTO,
  UpdatePreferencesRequestDTO,
  UpdateProfileRequestDTO,
} from '../validators/user.validator';

function toSafeUser(user: UserWithPopulatedPreferences): SafeUserDTO {
  return {
    id: String(user._id),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    preferences: user.preferences.map((category) => ({
      id: String(category._id),
      name: category.name,
      slug: category.slug,
    })),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function getUserProfile(userId: string): Promise<SafeUserDTO> {
  const user = await findUserByIdWithPreferences(userId);

  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  return toSafeUser(user);
}

export async function updateUserProfileData(
  userId: string,
  input: UpdateProfileRequestDTO,
): Promise<SafeUserDTO> {
  if (input.email) {
    const existingUser = await findUserByEmail(input.email);

    if (existingUser && String(existingUser._id) !== userId) {
      throw new ConflictError('An account with this email already exists');
    }
  }

  if (input.phone) {
    const existingUser = await findUserByPhone(input.phone);

    if (existingUser && String(existingUser._id) !== userId) {
      throw new ConflictError(
        'An account with this phone number already exists',
      );
    }
  }

  const updatedUser = await updateUserProfile(userId, input);

  if (!updatedUser) {
    throw new UnauthorizedError('User not found');
  }

  const populatedUser = await findUserByIdWithPreferences(userId);

  if (!populatedUser) {
    throw new UnauthorizedError('User not found');
  }

  return toSafeUser(populatedUser);
}



export async function changeUserPassword(
  userId: string,
  input: UpdatePasswordRequestDTO,
): Promise<void> {
  const user = await findUserByIdWithPassword(userId);

  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  const isCurrentPasswordValid = await comparePassword(input.currentPassword, user.password);

  if (!isCurrentPasswordValid) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  const hashedPassword = await hashPassword(input.newPassword);

  await updateUserPassword(userId, hashedPassword);
  await updateUserRefreshToken(userId, null);
}

export async function updateUserPreferenceData(
  userId: string,
  input: UpdatePreferencesRequestDTO,
): Promise<SafeUserDTO> {
  const uniquePreferenceIds = [...new Set(input.preferences)];

  const validCategories = await CategoryModel.find({
    _id: { $in: uniquePreferenceIds },
    isActive: true,
  }).select('_id');

  if (validCategories.length !== uniquePreferenceIds.length) {
    throw new BadRequestError('One or more selected preferences are invalid or inactive');
  }

  const preferences = validCategories.map((category) => category._id as Types.ObjectId);

  await updateUserPreferences(userId, preferences);

  const updatedUser = await findUserByIdWithPreferences(userId);

  if (!updatedUser) {
    throw new UnauthorizedError('User not found');
  }

  return toSafeUser(updatedUser);
}