import { Types } from 'mongoose';
import { OtpDocument, OtpPurpose } from '../models/otp.model';

export interface IOtpRepository {
  create(data: {
    userId: Types.ObjectId;
    email: string;
    otpHash: string;
    purpose: OtpPurpose;
  }): Promise<OtpDocument>;

  setExpiry(
    id: Types.ObjectId,
    expiresAt: Date,
  ): Promise<void>;

  findLatest(
    userId: Types.ObjectId,
    purpose: OtpPurpose,
  ): Promise<OtpDocument | null>;

  incrementAttempts(id: Types.ObjectId): Promise<void>;

  markVerified(id: Types.ObjectId): Promise<void>;

  deleteByUserAndPurpose(
    userId: Types.ObjectId,
    purpose: OtpPurpose,
  ): Promise<void>;
}