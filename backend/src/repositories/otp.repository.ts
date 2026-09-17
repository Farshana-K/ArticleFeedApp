import { Types } from 'mongoose';
import {
  OtpDocument,
  OtpModel,
  OtpPurpose,
} from '../models/otp.model';
import { IOtpRepository } from '../contracts/otp.repository.interface';

export class OtpRepository implements IOtpRepository {
  async create(data: {
    userId: Types.ObjectId;
    email: string;
    otpHash: string;
    purpose: OtpPurpose;
  }): Promise<OtpDocument> {
    return OtpModel.create(data);
  }

  async setExpiry(
    id: Types.ObjectId,
    expiresAt: Date,
  ): Promise<void> {
    await OtpModel.findByIdAndUpdate(id, {
      $set: { expiresAt },
    });
  }

  async findLatest(
    userId: Types.ObjectId,
    purpose: OtpPurpose,
  ): Promise<OtpDocument | null> {
    return OtpModel.findOne({
      userId,
      purpose,
      verifiedAt: null,
    }).sort({ createdAt: -1 });
  }

  async incrementAttempts(id: Types.ObjectId): Promise<void> {
    await OtpModel.findByIdAndUpdate(id, {
      $inc: { attempts: 1 },
    });
  }

  async markVerified(id: Types.ObjectId): Promise<void> {
    await OtpModel.findByIdAndUpdate(id, {
      verifiedAt: new Date(),
    });
  }

  async deleteByUserAndPurpose(
    userId: Types.ObjectId,
    purpose: OtpPurpose,
  ): Promise<void> {
    await OtpModel.deleteMany({
      userId,
      purpose,
    });
  }
}