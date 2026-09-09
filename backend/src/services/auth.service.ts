import { Types } from 'mongoose';
import { BadRequestError, ConflictError, UnauthorizedError } from '../errors/app.error';
import { CategoryModel } from '../models/category.model';
import {
  createUser,
  findUserByEmail,
  findUserByIdWithPreferences,
  findUserByIdWithRefreshToken,
  findUserByIdentifierWithPassword,
  findUserByPhone,
  updateUserRefreshToken,
  UserWithPopulatedPreferences,
} from '../repositories/user.repository';
import { RegisterRequestDTO, LoginRequestDTO } from '../validators/auth.validator';
import { SafeUserDTO } from '../dto/auth.dto';
import { comparePassword, hashPassword } from '../utils/password.util';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  RefreshTokenPayload,
} from '../utils/jwt.util';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends AuthTokens {
  user: SafeUserDTO;
}

/**
 * Confirms every supplied preference id refers to an existing, active
 * Category, and returns them as ObjectIds ready to store on the user.
 * This is a validation step for registration, not category management,
 * which stays out of scope for this phase.
 */
async function assertPreferencesAreValid(preferenceIds: string[]): Promise<Types.ObjectId[]> {
  if (preferenceIds.length === 0) {
    return [];
  }

  const activeCategories = await CategoryModel.find({
    _id: { $in: preferenceIds },
    isActive: true,
  }).select('_id');

  if (activeCategories.length !== preferenceIds.length) {
    throw new BadRequestError('One or more selected preferences are invalid or inactive');
  }

  return activeCategories.map((category) => category._id as unknown as Types.ObjectId);
}

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

async function issueTokensAndPersistRefreshToken(userId: string): Promise<AuthTokens> {
  const accessToken = generateAccessToken({ userId });
  const refreshToken = generateRefreshToken({ userId });

  // Store a hash of the refresh token (mirroring password storage), not
  // the raw token, so a database read alone can't be used to authenticate.
  await updateUserRefreshToken(userId, await hashPassword(refreshToken));

  return { accessToken, refreshToken };
}

export async function registerUser(input: RegisterRequestDTO): Promise<AuthResult> {
  const [existingEmail, existingPhone] = await Promise.all([
    findUserByEmail(input.email),
    findUserByPhone(input.phone),
  ]);

  if (existingEmail) {
    throw new ConflictError('An account with this email already exists');
  }

  if (existingPhone) {
    throw new ConflictError('An account with this phone number already exists');
  }

  const preferenceIds = await assertPreferencesAreValid(input.preferences);
  const hashedPassword = await hashPassword(input.password);

  const createdUser = await createUser({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    password: hashedPassword,
    dateOfBirth: input.dateOfBirth,
    preferences: preferenceIds,
  });

  const userId = String(createdUser._id);
  const tokens = await issueTokensAndPersistRefreshToken(userId);

  const populatedUser = await findUserByIdWithPreferences(userId);
  if (!populatedUser) {
    throw new BadRequestError('Failed to load the newly created user');
  }

  return { user: toSafeUser(populatedUser), ...tokens };
}

export async function loginUser(input: LoginRequestDTO): Promise<AuthResult> {
  const user = await findUserByIdentifierWithPassword(input.identifier);

  // Generic message regardless of which check fails, so a caller can't
  // determine whether the account exists.
  if (!user) {
    throw new UnauthorizedError('Invalid email/phone or password');
  }

  const isPasswordValid = await comparePassword(input.password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email/phone or password');
  }

  const userId = String(user._id);
  const tokens = await issueTokensAndPersistRefreshToken(userId);

  const populatedUser = await findUserByIdWithPreferences(userId);
  if (!populatedUser) {
    throw new UnauthorizedError('Invalid email/phone or password');
  }

  return { user: toSafeUser(populatedUser), ...tokens };
}

export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
  let payload: RefreshTokenPayload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const user = await findUserByIdWithRefreshToken(payload.userId);

  if (!user || !user.refreshToken) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const isStoredTokenValid = await comparePassword(refreshToken, user.refreshToken);

  if (!isStoredTokenValid) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const accessToken = generateAccessToken({ userId: String(user._id) });

  return { accessToken };
}

/**
 * Safe to call with an unknown/undefined userId — logout must not error
 * just because the caller is already logged out or the token was invalid.
 */
export async function logoutUser(userId: string | undefined): Promise<void> {
  if (!userId) {
    return;
  }

  await updateUserRefreshToken(userId, null);
}

export async function getCurrentUser(userId: string): Promise<SafeUserDTO> {
  const user = await findUserByIdWithPreferences(userId);

  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  return toSafeUser(user);
}
