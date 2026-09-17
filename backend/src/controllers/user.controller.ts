import { Request, Response } from "express";
import { UnauthorizedError } from "../errors/app.error";
import { UserService } from "../services/user.service";
import {
  UpdatePasswordRequestDTO,
  UpdatePreferencesRequestDTO,
  UpdateProfileRequestDTO,
} from "../validators/user.validator";
import { asyncHandler } from "../utils/async-handler.util";
import { successResponse } from "../utils/api-response.util";
export class UserController {
  constructor(private readonly userService: UserService) {}

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const user = await this.userService.getProfile(req.user.userId);
    res
      .status(200)
      .json(successResponse("Profile retrieved successfully", { user }));
  });
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const user = await this.userService.updateProfile(
      req.user.userId,
      req.body as UpdateProfileRequestDTO,
    );
    res
      .status(200)
      .json(successResponse("Profile updated successfully", { user }));
  });
  updatePassword = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    await this.userService.changePassword(
      req.user.userId,
      req.body as UpdatePasswordRequestDTO,
    );
    res.status(200).json(successResponse("Password updated successfully"));
  });
  updatePreferences = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const user = await this.userService.updatePreferences(
      req.user.userId,
      req.body as UpdatePreferencesRequestDTO,
    );
    res
      .status(200)
      .json(successResponse("Preferences updated successfully", { user }));
  });
}
