import { randomInt } from 'crypto';
import { Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { OtpPurpose } from '../models/otp.model';
import { BadRequestError } from '../errors/app.error';
import { IOtpRepository } from '../contracts/otp.repository.interface';

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 1;
const MAX_OTP_ATTEMPTS = 5;

export class OtpService {
  constructor(private readonly otpRepository: IOtpRepository) {}

  async generateAndStoreOtp(
    userId: Types.ObjectId,
    email: string,
    purpose: OtpPurpose,
  ): Promise<string> {
    await this.otpRepository.deleteByUserAndPurpose(userId, purpose);

    const otp = this.generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    await this.otpRepository.create({
      userId,
      email,
      otpHash,
      purpose,
    });

    return otp;
  }

  async startOtpExpiry(
    userId: Types.ObjectId,
    purpose: OtpPurpose,
  ): Promise<Date> {
    const otpRecord = await this.otpRepository.findLatest(
      userId,
      purpose,
    );

    if (!otpRecord) {
      throw new BadRequestError('OTP not found');
    }

    const expiresAt = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
    );

    await this.otpRepository.setExpiry(
      otpRecord._id,
      expiresAt,
    );
    return expiresAt;
  }

  async verifyOtp(
    userId: Types.ObjectId,
    otp: string,
    purpose: OtpPurpose,
  ): Promise<void> {
    const otpRecord = await this.otpRepository.findLatest(userId, purpose);

    if (!otpRecord) {
      throw new BadRequestError('OTP not found or expired');
    }

    if (!otpRecord.expiresAt) {
      throw new BadRequestError('OTP is not active');
    }

    if (otpRecord.expiresAt.getTime() < Date.now()) {
      throw new BadRequestError('OTP has expired');
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      throw new BadRequestError(
        'Maximum OTP verification attempts exceeded',
      );
    }

    const isOtpValid = await bcrypt.compare(otp, otpRecord.otpHash);

    if (!isOtpValid) {
      await this.otpRepository.incrementAttempts(otpRecord._id);
      throw new BadRequestError('Invalid OTP');
    }

    await this.otpRepository.markVerified(otpRecord._id);
  }

  async deleteOtp(
    userId: Types.ObjectId,
    purpose: OtpPurpose,
  ): Promise<void> {
    await this.otpRepository.deleteByUserAndPurpose(userId, purpose);
  }

  private generateOtp(): string {
    return randomInt(0, 10 ** OTP_LENGTH)
      .toString()
      .padStart(OTP_LENGTH, '0');
  }
}