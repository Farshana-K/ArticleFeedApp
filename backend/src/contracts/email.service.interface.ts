export interface IEmailService {
  sendEmailVerificationOtp(
    email: string,
    otp: string,
  ): Promise<void>;

  sendPasswordResetOtp(
    email: string,
    otp: string,
  ): Promise<void>;
}