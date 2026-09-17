import { Document, Model, Schema, Types, model } from 'mongoose';

export enum OtpPurpose {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

export interface OtpDocument extends Document {
  userId: Types.ObjectId;
  email: string;
  otpHash: string;
  purpose: OtpPurpose;
  expiresAt: Date | null;
  attempts: number;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const otpSchema = new Schema<OtpDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    otpHash: {
      type: String,
      required: [true, 'OTP hash is required'],
    },
    purpose: {
      type: String,
      enum: Object.values(OtpPurpose),
      required: [true, 'OTP purpose is required'],
    },
    expiresAt: {
      type: Date,
      default:null,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpModel: Model<OtpDocument> = model<OtpDocument>(
  'Otp',
  otpSchema,
);