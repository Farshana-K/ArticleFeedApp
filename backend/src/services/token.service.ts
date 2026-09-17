import {
  AccessTokenPayload,
  ITokenService,
  PasswordResetTokenPayload,
  RefreshTokenPayload,
} from '../contracts/token.service.interface';

import {
  generateAccessToken as createAccessToken,
  generatePasswordResetToken as createPasswordResetToken,
  generateRefreshToken as createRefreshToken,
  verifyAccessToken as decodeAccessToken,
  verifyPasswordResetToken as decodePasswordResetToken,
  verifyRefreshToken as decodeRefreshToken,
} from '../utils/jwt.util';

export class TokenService implements ITokenService {
  generateAccessToken(payload: AccessTokenPayload): string {
    return createAccessToken(payload);
  }

  generateRefreshToken(payload: RefreshTokenPayload): string {
    return createRefreshToken(payload);
  }

  generatePasswordResetToken(
    payload: PasswordResetTokenPayload,
  ): string {
    return createPasswordResetToken(payload);
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return decodeAccessToken(token);
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    return decodeRefreshToken(token);
  }

  verifyPasswordResetToken(
    token: string,
  ): PasswordResetTokenPayload {
    return decodePasswordResetToken(token);
  }
}