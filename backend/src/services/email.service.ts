
import nodemailer, { Transporter } from 'nodemailer';

import { env } from '../config/env.config';
import { IEmailService } from '../contracts/email.service.interface';

export class EmailService implements IEmailService {
  private readonly transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmailVerificationOtp(
    email: string,
    otp: string,
  ): Promise<void> {
    await this.transporter.sendMail({
      from: env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email',
      text: `Your email verification OTP is ${otp}. It will expire in 1 minute.`,
    });
  }

  async sendPasswordResetOtp(
    email: string,
    otp: string,
  ): Promise<void> {
    await this.transporter.sendMail({
      from: env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your password reset OTP is ${otp}. It will expire in 1 minute.`,
    });
  }
}

