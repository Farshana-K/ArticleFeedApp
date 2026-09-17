import { Types } from "mongoose";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from "../errors/app.error";
import { IUserRepository } from "../contracts/user.repository.interface";
import { ICategoryRepository } from "../contracts/category.repository.interface";
import { IPasswordService } from "../contracts/password.service.interface";
import {
  ITokenService,
  RefreshTokenPayload,
} from "../contracts/token.service.interface";
import {
  RegisterRequestDTO,
  LoginRequestDTO,
} from "../validators/auth.validator";
import { SafeUserDTO } from "../dto/auth.dto";
import { toSafeUserDTO } from "../mappers/user.mapper";
import { EmailVerificationService } from "./email-verification.service";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
export interface AuthResult extends AuthTokens {
  user: SafeUserDTO;
}

export interface RegistrationResult {
  user: SafeUserDTO;
  message: string;
  expiresAt: Date;
}

export class AuthService {
  constructor(
    private readonly users: IUserRepository,
    private readonly categories: ICategoryRepository,
    private readonly passwords: IPasswordService,
    private readonly tokens: ITokenService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  private async validatePreferences(ids: string[]): Promise<Types.ObjectId[]> {
    if (!ids.length) return [];
    const categories = await this.categories.findActiveByIds(ids);
    if (categories.length !== ids.length)
      throw new BadRequestError(
        "One or more selected preferences are invalid or inactive",
      );
    return categories.map((category) => category._id as Types.ObjectId);
  }

  private async issueTokens(userId: string): Promise<AuthTokens> {
    const accessToken = this.tokens.generateAccessToken({ userId });
    const refreshToken = this.tokens.generateRefreshToken({ userId });
    await this.users.updateRefreshToken(
      userId,
      await this.passwords.hash(refreshToken),
    );
    return { accessToken, refreshToken };
  }

  async register(input: RegisterRequestDTO): Promise<RegistrationResult> {
    const [email, phone] = await Promise.all([
      this.users.findByEmail(input.email),
      this.users.findByPhone(input.phone),
    ]);

    if (email) {
      throw new ConflictError(
        'An account with this email already exists',
      );
    }

    if (phone) {
      throw new ConflictError(
        'An account with this phone number already exists',
      );
    }

    const preferences = await this.validatePreferences(input.preferences);

    const user = await this.users.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      password: await this.passwords.hash(input.password),
      dateOfBirth: input.dateOfBirth,
      preferences,
      emailVerified: false,
    });

    let expiresAt: Date;

    try {
       expiresAt = await this.emailVerificationService.sendVerificationOtp(
        user._id as Types.ObjectId,
        user.email,
      );
    } catch (error) {
      await this.emailVerificationService.deleteVerificationOtp(
        user._id as Types.ObjectId,
      );

      await this.users.deleteById(String(user._id));

      throw error;
    }

    const populated = await this.users.findByIdWithPreferences(
      String(user._id),
    );

    if (!populated) {
      throw new BadRequestError(
        'Failed to load the newly created user',
      );
    }

    return {
      user: toSafeUserDTO(populated),
      message:
        'Registration successful. Verification OTP sent to your email.',
      expiresAt,
    };
  }

  async getUserForVerification(userId: string) {
  const user = await this.users.findById(userId);

  if (!user) {
    throw new BadRequestError('User not found');
  }

  if (user.emailVerified) {
    throw new BadRequestError('Email is already verified');
  }

  return user;
}

  async login(input: LoginRequestDTO): Promise<AuthResult> {
    const user = await this.users.findByIdentifierWithPassword(
      input.identifier,
    );

    if (
      !user ||
      !(await this.passwords.compare(input.password, user.password))
    ) {
      throw new UnauthorizedError('Invalid email/phone or password');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedError(
        'Please verify your email before logging in',
      );
    }

    const tokens = await this.issueTokens(String(user._id));

    const populated = await this.users.findByIdWithPreferences(
      String(user._id),
    );

    if (!populated) {
      throw new UnauthorizedError('Invalid email/phone or password');
    }

    return { user: toSafeUserDTO(populated), ...tokens };
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    let payload: RefreshTokenPayload;
    try {
      payload = this.tokens.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }
    const user = await this.users.findByIdWithRefreshToken(payload.userId);
    if (
      !user?.refreshToken ||
      !(await this.passwords.compare(refreshToken, user.refreshToken))
    )
      throw new UnauthorizedError("Invalid or expired refresh token");
    return {
      accessToken: this.tokens.generateAccessToken({
        userId: String(user._id),
      }),
    };
  }

  async logout(userId?: string): Promise<void> {
    if (userId) await this.users.updateRefreshToken(userId, null);
  }

  async getCurrentUser(userId: string): Promise<SafeUserDTO> {
    const user = await this.users.findByIdWithPreferences(userId);
    if (!user) throw new UnauthorizedError("User not found");
    return toSafeUserDTO(user);
  }
}
