import { Request, Response } from 'express';
import { UnauthorizedError, BadRequestError } from '../errors/app.error';
import { asyncHandler } from '../utils/async-handler.util';
import { successResponse } from '../utils/api-response.util';
import { CreateArticleRequestDTO, UpdateArticleRequestDTO } from '../validators/article.validator';
import { ArticleService } from '../services/article.service';
import { IUserRepository } from '../contracts/user.repository.interface';

export class ArticleController {
  constructor(private readonly articleService: ArticleService, private readonly users: IUserRepository) {}
  private getId(req: Request): string { const id = req.params.id; if (!id) throw new BadRequestError('Article ID is required'); return id; }
  createArticle = asyncHandler(async (req: Request, res: Response) => { if (!req.user) throw new UnauthorizedError('Authentication required'); const article = await this.articleService.create(req.user.userId, req.body as CreateArticleRequestDTO); res.status(201).json(successResponse('Article created successfully', { article })); });
  getArticles = asyncHandler(async (_req: Request, res: Response) => { const articles = await this.articleService.getAll(); res.status(200).json(successResponse('Articles retrieved successfully', { articles })); });
  getArticleById = asyncHandler(async (req: Request, res: Response) => { const article = await this.articleService.getById(this.getId(req)); res.status(200).json(successResponse('Article retrieved successfully', { article })); });
  updateArticle = asyncHandler(async (req: Request, res: Response) => { if (!req.user) throw new UnauthorizedError('Authentication required'); const article = await this.articleService.updateOwn(this.getId(req), req.user.userId, req.body as UpdateArticleRequestDTO); res.status(200).json(successResponse('Article updated successfully', { article })); });
  deleteArticle = asyncHandler(async (req: Request, res: Response) => { if (!req.user) throw new UnauthorizedError('Authentication required'); await this.articleService.deleteOwn(this.getId(req), req.user.userId); res.status(200).json(successResponse('Article deleted successfully')); });
  getPersonalizedFeed = asyncHandler(async (req: Request, res: Response) => { if (!req.user) throw new UnauthorizedError('Authentication required'); const user = await this.users.findByIdWithPreferences(req.user.userId); if (!user) throw new UnauthorizedError('User not found'); const categoryIds = user.preferences.map((category) => String(category._id)); const articles = await this.articleService.getPersonalized(categoryIds, req.user.userId); res.status(200).json(successResponse('Personalized articles retrieved successfully', { articles })); });
  getMyArticles = asyncHandler(async (req: Request, res: Response) => { if (!req.user) throw new UnauthorizedError('Authentication required'); const articles = await this.articleService.getMy(req.user.userId); res.status(200).json(successResponse('Your articles retrieved successfully', { articles })); });
}
