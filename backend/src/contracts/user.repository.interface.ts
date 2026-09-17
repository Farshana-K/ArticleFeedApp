import { Types } from "mongoose";
import { CategoryDocument } from "../models/category.model";
import { UserDocument } from "../models/user.model";

export type UserWithPopulatedPreferences = Omit<UserDocument, "preferences"> & {
  preferences: CategoryDocument[];
};
export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  phone: string;
  password: string;
  dateOfBirth: Date;
  preferences: Types.ObjectId[];
}
export interface IUserRepository {
  findByEmail(email: string): Promise<UserDocument | null>;
  findByPhone(phone: string): Promise<UserDocument | null>;
  deleteById(userId: string): Promise<void>;
  findByIdentifierWithPassword(
    identifier: string,
  ): Promise<UserDocument | null>;
  findById(userId: string): Promise<UserDocument | null>;
  findByIdWithPreferences(
    userId: string,
  ): Promise<UserWithPopulatedPreferences | null>;
  findByIdWithRefreshToken(userId: string): Promise<UserDocument | null>;
  findByIdWithPassword(userId: string): Promise<UserDocument | null>;

  create(input: CreateUserInput): Promise<UserDocument>;

  verifyEmail(userId: string): Promise<void>;

  updateRefreshToken(
    userId: string,
    hashedRefreshToken: string | null,
  ): Promise<void>;

  updateProfile(
    userId: string,
    updates: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      dateOfBirth?: Date;
    },
  ): Promise<UserDocument | null>;

  updatePassword(userId: string, hashedPassword: string): Promise<void>;

  updatePreferences(
    userId: string,
    preferences: Types.ObjectId[],
  ): Promise<void>;
}
