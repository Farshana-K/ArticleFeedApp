
import { Request, Response } from 'express';

import { asyncHandler } from '../utils/async-handler.util';

import { successResponse } from '../utils/api-response.util';

import {
  RegisterRequestDTO,
  LoginRequestDTO,
  ForgotPasswordRequestDTO,
  VerifyPasswordResetOtpRequestDTO,
  ResetPasswordRequestDTO
} from '../validators/auth.validator';

import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  clearAuthCookies,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from '../utils/cookie.util';

import { readCookieValue } from '../middlewares/auth.middleware';

import { UnauthorizedError } from '../errors/app.error';

import { AuthService } from '../services/auth.service';

import { EmailVerificationService } from '../services/email-verification.service';

import { ITokenService } from '../contracts/token.service.interface';

import { PasswordResetService } from '../services/password-reset.service';

export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: ITokenService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.register(
      req.body as RegisterRequestDTO,
    );

    res.status(201).json(
      successResponse(result.message, {
        user: result.user,
        expiresAt: result.expiresAt,
      }),
    );
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { userId, otp } = req.body as {
      userId: string;
      otp: string;
    };

    await this.emailVerificationService.verifyEmail(userId, otp);

    res
      .status(200)
      .json(successResponse('Email verified successfully'));
  });

  resendVerificationOtp = asyncHandler(
    async (req: Request, res: Response) => {
      const { userId } = req.body as {
        userId: string;
      };

      const user = await this.authService.getUserForVerification(userId);

      const expiresAt =
        await this.emailVerificationService.sendVerificationOtp(
          user._id,
          user.email,
        );

      res.status(200).json(
        successResponse('Verification OTP sent successfully', {
          expiresAt,
        }),
      );
    },
  );

 forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as ForgotPasswordRequestDTO;

  const result = await this.passwordResetService.sendPasswordResetOtp(email);

    res.status(200).json(
      successResponse('Password reset OTP has been sent.', {
        userId: result.userId,
        expiresAt: result.expiresAt,
      }),
    );
});

resendPasswordResetOtp = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.body as {
      userId: string;
    };

    const result =
      await this.passwordResetService.resendPasswordResetOtp(userId);

    res.status(200).json(
      successResponse('Password reset OTP sent successfully', {
        expiresAt: result.expiresAt,
      }),
    );
  },
);

resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      resetToken,
      newPassword,
    } = req.body as ResetPasswordRequestDTO;

    await this.passwordResetService.resetPassword(
      resetToken,
      newPassword,
    );

    res.status(200).json(
      successResponse('Password reset successfully'),
    );
  },
);

  verifyPasswordResetOtp = asyncHandler(  async (req: Request, res: Response) => {
      const { userId, otp,  } = req.body as VerifyPasswordResetOtpRequestDTO;

      const resetToken = await this.passwordResetService.verifyPasswordResetOtp(
          userId,
          otp,
        );

      res.status(200).json(
        successResponse('Password reset OTP verified successfully', {
          resetToken,
        }),
      );
    },
  );

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.login(req.body as LoginRequestDTO);

    setAccessTokenCookie(res, result.accessToken);
    setRefreshTokenCookie(res, result.refreshToken);

    res
      .status(200)
      .json(successResponse('Login successful', { user: result.user }));
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const token = readCookieValue(req, REFRESH_TOKEN_COOKIE_NAME);

    if (!token) {
      throw new UnauthorizedError('Refresh token not provided');
    }

    const result = await this.authService.refreshAccessToken(token);

    setAccessTokenCookie(res, result.accessToken);

    res.status(200).json(successResponse('Access token refreshed'));
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const token = readCookieValue(req, ACCESS_TOKEN_COOKIE_NAME);

    let userId: string | undefined;

    if (token) {
      try {
        userId = this.tokenService.verifyAccessToken(token).userId;
      } catch {
        userId = undefined;
      }
    }

    await this.authService.logout(userId);

    clearAuthCookies(res);

    res.status(200).json(successResponse('Logout successful'));
  });

  getMe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const user = await this.authService.getCurrentUser(req.user.userId);

    res
      .status(200)
      .json(successResponse('Current user retrieved', { user }));
  });
}

