export interface AccessTokenPayload {
  userId: string;
}

export interface RefreshTokenPayload {
  userId: string;
}

export interface PasswordResetTokenPayload {
  userId: string;
}

export interface ITokenService {
  generateAccessToken(payload: AccessTokenPayload): string;

  generateRefreshToken(payload: RefreshTokenPayload): string;

  generatePasswordResetToken( payload: PasswordResetTokenPayload, ): string;

  verifyAccessToken(token: string): AccessTokenPayload;

  verifyRefreshToken(token: string): RefreshTokenPayload;

  verifyPasswordResetToken(  token: string, ): PasswordResetTokenPayload;
}