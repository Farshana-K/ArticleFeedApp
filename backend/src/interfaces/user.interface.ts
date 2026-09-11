import { Types } from 'mongoose';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth: Date;
  preferences: Types.ObjectId[];
  role: UserRole;
  refreshToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}