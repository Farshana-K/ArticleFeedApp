import { Types } from 'mongoose';
import { CategoryDocument } from '../models/category.model';
import { UserDocument, UserModel } from '../models/user.model';

export type UserWithPopulatedPreferences = Omit<UserDocument, 'preferences'> & {
  preferences: CategoryDocument[];
};

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string; // already hashed by the service layer
  dateOfBirth: Date;
  preferences: Types.ObjectId[];
}

export async function findUserByEmail(email: string): Promise<UserDocument | null> {
  return UserModel.findOne({ email });
}

export async function findUserByPhone(phone: string): Promise<UserDocument | null> {
  return UserModel.findOne({ phone });
}

function isEmailIdentifier(identifier: string): boolean {
  return identifier.includes('@');
}

export async function findUserByIdentifier(identifier: string): Promise<UserDocument | null> {
  return isEmailIdentifier(identifier)
    ? findUserByEmail(identifier)
    : findUserByPhone(identifier);
}

/** Explicitly selects the password field, which is excluded by default. */
export async function findUserByIdentifierWithPassword(
  identifier: string,
): Promise<UserDocument | null> {
  const query = isEmailIdentifier(identifier) ? { email: identifier } : { phone: identifier };
  return UserModel.findOne(query).select('+password');
}

export async function findUserById(userId: string): Promise<UserDocument | null> {
  return UserModel.findById(userId);
}

/**
 * Loads a user with `preferences` populated as full Category documents.
 * The cast reflects what `.populate('preferences')` produces at runtime;
 * Mongoose does not statically change the awaited type on its own.
 */
export async function findUserByIdWithPreferences(
  userId: string,
): Promise<UserWithPopulatedPreferences | null> {
  const user = await UserModel.findById(userId).populate('preferences');
  return user as unknown as UserWithPopulatedPreferences | null;
}

/** Explicitly selects the refreshToken field, which is excluded by default. */
export async function findUserByIdWithRefreshToken(userId: string): Promise<UserDocument | null> {
  return UserModel.findById(userId).select('+refreshToken');
}

export async function createUser(input: CreateUserInput): Promise<UserDocument> {
  return UserModel.create(input);
}

export async function updateUserRefreshToken(
  userId: string,
  hashedRefreshToken: string | null,
): Promise<void> {
  await UserModel.findByIdAndUpdate(userId, { refreshToken: hashedRefreshToken });
}
