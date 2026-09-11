import { Request, Response } from 'express';
import { UnauthorizedError, BadRequestError } from '../errors/app.error';
import {
  createNewArticle, deleteOwnArticle, getAllArticles, getArticle, getMyArticles, getPersonalizedArticles, updateOwnArticle,
} from '../services/article.service';
import {
  CreateArticleRequestDTO, UpdateArticleRequestDTO,
} from '../validators/article.validator';
import { asyncHandler } from '../utils/async-handler.util';
import { successResponse } from '../utils/api-response.util';
import { findUserByIdWithPreferences } from '../repositories/user.repository';

function getArticleId(req: Request): string {
  const { id } = req.params;
  if (!id) throw new BadRequestError('Article ID is required');
  return id;
}

export const createArticle = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError('Authentication required');
  const article = await createNewArticle(req.user.userId, req.body as CreateArticleRequestDTO);
  res.status(201).json(successResponse('Article created successfully', { article }));
});

export const getArticles = asyncHandler(async (_req: Request, res: Response) => {
  const articles = await getAllArticles();
  res.status(200).json(successResponse('Articles retrieved successfully', { articles }));
});

export const getArticleById = asyncHandler(async (req: Request, res: Response) => {
  const article = await getArticle(getArticleId(req));
  res.status(200).json(successResponse('Article retrieved successfully', { article }));
});

export const updateArticle = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError('Authentication required');
  const article = await updateOwnArticle(getArticleId(req), req.user.userId, req.body as UpdateArticleRequestDTO);
  res.status(200).json(successResponse('Article updated successfully', { article }));
});

export const deleteArticle = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError('Authentication required');
  await deleteOwnArticle(getArticleId(req), req.user.userId);
  res.status(200).json(successResponse('Article deleted successfully'));
});

export const getPersonalizedFeed = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError('Authentication required');

  const user = await findUserByIdWithPreferences(req.user.userId);
  if (!user) throw new UnauthorizedError('User not found');

  const categoryIds = user.preferences.map((category) => String(category._id));
  const articles = await getPersonalizedArticles(categoryIds, req.user.userId);
  res.status(200).json(successResponse('Personalized articles retrieved successfully', { articles }));
});

export const getMyArticlesController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError('Authentication required');

  const articles = await getMyArticles(req.user.userId);
  res.status(200).json(successResponse('Your articles retrieved successfully', { articles }));
});