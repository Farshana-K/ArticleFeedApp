
import { Resend } from 'resend';

import { env } from '../config/env.config';
import { IEmailService } from '../contracts/email.service.interface';

export class EmailService implements IEmailService {
  private readonly resend: Resend;

  constructor() {
    this.resend = new Resend(env.RESEND_API_KEY);
  }

  async sendEmailVerificationOtp(
    email: string,
    otp: string,
  ): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email',
      text: `Your email verification OTP is ${otp}. It will expire in 1 minute.`,
    });

    if (error) {
      throw new Error(
        `Failed to send verification email: ${error.message}`,
      );
    }
  }

  async sendPasswordResetOtp(
    email: string,
    otp: string,
  ): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your password reset OTP is ${otp}. It will expire in 1 minute.`,
    });

    if (error) {
      throw new Error(
        `Failed to send password reset email: ${error.message}`,
      );
    }
  }
}

