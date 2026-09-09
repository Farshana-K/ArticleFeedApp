import { Document, Model, Schema, model } from 'mongoose';
import { IUser } from '../interfaces/user.interface';

export interface UserDocument extends IUser, Document {}

const userSchema = new Schema<UserDocument>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      // Excluded from query results by default; must be explicitly
      // requested with .select('+password') during authentication.
      select: false,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    preferences: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
      default: [],
    },
    refreshToken: {
      type: String,
      // Excluded by default for the same reason as password; the stored
      // value is a bcrypt hash of the refresh token, not the raw token.
      select: false,
      default: null,
    },
  },
  { timestamps: true },
);

// email and phone already carry unique indexes via `unique: true` above;
// no additional single-field index declarations are needed here.

export const UserModel: Model<UserDocument> = model<UserDocument>('User', userSchema);
