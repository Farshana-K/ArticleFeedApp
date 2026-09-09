import { Types } from 'mongoose';

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth: Date;
  preferences: Types.ObjectId[];
  refreshToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}
