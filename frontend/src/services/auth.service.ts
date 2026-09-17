import { api } from "./api";

export interface LoginInput {
  identifier: string;
  password: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
  preferences: string[];
}

export interface ForgotPasswordInput {
  email: string;
}

export interface VerifyOtpInput {
  userId: string;
  otp: string;
}

export interface ResetPasswordInput {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

export async function login(input: LoginInput) {
  return api.post("/auth/login", input);
}

export async function register(input: RegisterInput) {
  return api.post("/auth/register", input);
}

export async function forgotPassword(input: ForgotPasswordInput) {
  return api.post("/auth/forgot-password", input);
}

export async function verifyEmail(input: VerifyOtpInput) {
  return api.post("/auth/verify-email", input);
}

export async function resendVerificationOtp(userId: string) {
  return api.post("/auth/resend-verification-otp", {
    userId,
  });
}

export async function verifyPasswordResetOtp(input: VerifyOtpInput) {
  return api.post("/auth/verify-password-reset-otp", input);
}

export async function resendPasswordResetOtp(userId: string) {
  return api.post("/auth/resend-password-reset-otp", {
    userId,
  });
}

export async function resetPassword(input: ResetPasswordInput) {
  return api.post("/auth/reset-password", input);
}

export async function getCurrentUser() {
  return api.get("/auth/me");
}

export async function logout() {
  return api.post("/auth/logout");
}
