import { Types } from 'mongoose';
import { IEmailService } from '../contracts/email.service.interface';
import { IUserRepository } from '../contracts/user.repository.interface';
import { OtpPurpose } from '../models/otp.model';
import { OtpService } from './otp.service';

export class EmailVerificationService {
  constructor(
    private readonly otpService: OtpService,
    private readonly emailService: IEmailService,
    private readonly userRepository: IUserRepository,
  ) {}

  async sendVerificationOtp(
    userId: Types.ObjectId,
    email: string,
  ): Promise<Date> {
    const otp = await this.otpService.generateAndStoreOtp(
      userId,
      email,
      OtpPurpose.EMAIL_VERIFICATION,
    );

    await this.emailService.sendEmailVerificationOtp(email, otp);
    return await this.otpService.startOtpExpiry(
      userId,
      OtpPurpose.EMAIL_VERIFICATION,
    );
  }

  async verifyEmail(
    userId: string,
    otp: string,
  ): Promise<void> {
    await this.otpService.verifyOtp(
      new Types.ObjectId(userId),
      otp,
      OtpPurpose.EMAIL_VERIFICATION,
    );

    await this.userRepository.verifyEmail(userId);
  }

  async deleteVerificationOtp(
  userId: Types.ObjectId,
): Promise<void> {
  await this.otpService.deleteOtp(
    userId,
    OtpPurpose.EMAIL_VERIFICATION,
  );
}
}