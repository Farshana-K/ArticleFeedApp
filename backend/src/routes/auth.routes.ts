import { Router } from "express";

import { authController } from "../factories/controllers.factory";
import { requireAuth } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validate.middleware";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendPasswordResetOtpSchema,
  resendVerificationOtpSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  verifyPasswordResetOtpSchema,
} from "../validators/auth.validator";

const router = Router();

router.post("/register", validateBody(registerSchema), authController.register);

router.post(
  "/verify-email",
  validateBody(verifyEmailSchema),
  authController.verifyEmail,
);

router.post(
  "/resend-verification-otp",
  validateBody(resendVerificationOtpSchema),
  authController.resendVerificationOtp,
);

router.post("/login", validateBody(loginSchema), authController.login);

router.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  authController.forgotPassword,
);

router.post(
  "/verify-password-reset-otp",
  validateBody(verifyPasswordResetOtpSchema),
  authController.verifyPasswordResetOtp,
);

router.post(
  "/resend-password-reset-otp",
  validateBody(resendPasswordResetOtpSchema),
  authController.resendPasswordResetOtp,
);

router.post("/refresh", authController.refresh);

router.post("/logout", authController.logout);

router.get("/me", requireAuth, authController.getMe);

router.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  authController.resetPassword,
);

export default router;
