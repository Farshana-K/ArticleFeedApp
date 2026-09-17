import { Request, Response } from "express";
import { UnauthorizedError, BadRequestError } from "../errors/app.error";
import { ArticleInteractionService } from "../services/article-interaction.service";
import { ArticleInteractionDTO } from "../validators/article-interaction.validator";
import { asyncHandler } from "../utils/async-handler.util";
import { successResponse } from "../utils/api-response.util";
export class ArticleInteractionController {
  constructor(private readonly service: ArticleInteractionService) {}
  
  private getId(req: Request): string {
    const id = req.params.id;
    if (!id) throw new BadRequestError("Article ID is required");
    return id;
  }
  interact = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const counts = await this.service.set(
      this.getId(req),
      req.user.userId,
      req.body as ArticleInteractionDTO,
    );
    res
      .status(200) 
      .json(
        successResponse("Article interaction updated successfully", { counts }),
      );
  });
  remove = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    await this.service.remove(this.getId(req), req.user.userId);
    res
      .status(200)
      .json(successResponse("Article interaction removed successfully", {}));
  });
  getBlocked = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const articles = await this.service.getBlocked(req.user.userId);
    res
      .status(200)
      .json(
        successResponse("Blocked articles retrieved successfully", {
          articles,
        }),
      );
  });
}
