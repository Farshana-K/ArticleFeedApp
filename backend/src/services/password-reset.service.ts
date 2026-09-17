
import { Types } from 'mongoose';

import { IEmailService } from '../contracts/email.service.interface';
import { IPasswordService } from '../contracts/password.service.interface';
import { ITokenService } from '../contracts/token.service.interface';
import { IUserRepository } from '../contracts/user.repository.interface';
import { BadRequestError } from '../errors/app.error';
import { OtpPurpose } from '../models/otp.model';
import { OtpService } from './otp.service';

export class PasswordResetService {
  constructor(
    private readonly otpService: OtpService,
    private readonly emailService: IEmailService,
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
    private readonly passwordService: IPasswordService,
  ) {}

  async sendPasswordResetOtp(
    email: string,
  ): Promise<{ userId: string; expiresAt: Date }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new BadRequestError('User not found');
    }

    const otp = await this.otpService.generateAndStoreOtp(
      user._id,
      user.email,
      OtpPurpose.PASSWORD_RESET,
    );

    try {
      await this.emailService.sendPasswordResetOtp(
        user.email,
        otp,
      );

      const expiresAt = await this.otpService.startOtpExpiry(
        user._id,
        OtpPurpose.PASSWORD_RESET,
      );

      return {
        userId: String(user._id),
        expiresAt,
      };
    } catch (error) {
      await this.otpService.deleteOtp(
        user._id,
        OtpPurpose.PASSWORD_RESET,
      );

      throw error;
    }
  }

  async resendPasswordResetOtp(
    userId: string,
  ): Promise<{ expiresAt: Date }> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new BadRequestError('User not found');
    }

    const otp = await this.otpService.generateAndStoreOtp(
      user._id,
      user.email,
      OtpPurpose.PASSWORD_RESET,
    );

    try {
      await this.emailService.sendPasswordResetOtp(
        user.email,
        otp,
      );

      const expiresAt = await this.otpService.startOtpExpiry(
        user._id,
        OtpPurpose.PASSWORD_RESET,
      );

      return {
        expiresAt,
      };
    } catch (error) {
      await this.otpService.deleteOtp(
        user._id,
        OtpPurpose.PASSWORD_RESET,
      );

      throw error;
    }
  }

  async verifyPasswordResetOtp(
    userId: string,
    otp: string,
  ): Promise<string> {
    await this.otpService.verifyOtp(
      new Types.ObjectId(userId),
      otp,
      OtpPurpose.PASSWORD_RESET,
    );

    return this.tokenService.generatePasswordResetToken({
      userId,
    });
  }

  async resetPassword(
    resetToken: string,
    newPassword: string,
  ): Promise<void> {
    const { userId } =
      this.tokenService.verifyPasswordResetToken(resetToken);

    const hashedPassword =
      await this.passwordService.hash(newPassword);

    await this.userRepository.updatePassword(
      userId,
      hashedPassword,
    );
  }
}

