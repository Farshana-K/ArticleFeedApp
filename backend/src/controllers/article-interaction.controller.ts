import { Request, Response } from 'express';
import { UnauthorizedError, BadRequestError } from '../errors/app.error';
import {
  getBlockedArticles,
  removeArticleInteraction,
  setArticleInteraction,
} from '../services/article-interaction.service';
import { ArticleInteractionDTO } from '../validators/article-interaction.validator';
import { asyncHandler } from '../utils/async-handler.util';
import { successResponse } from '../utils/api-response.util';

export const interactWithArticle = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { id } = req.params;
    if (!id) throw new BadRequestError('Article ID is required');

    const counts = await setArticleInteraction(
      id,
      req.user.userId,
      req.body as ArticleInteractionDTO,
    );

    res.status(200).json(
      successResponse('Article interaction updated successfully', { counts }),
    );
  },
);

export const removeArticleInteractionController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { id } = req.params;
    if (!id) throw new BadRequestError('Article ID is required');

    await removeArticleInteraction(id, req.user.userId);

    res.status(200).json(
      successResponse('Article interaction removed successfully', {}),
    );
  },
);

export const getBlockedArticlesController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const articles = await getBlockedArticles(req.user.userId);

    res.status(200).json(
      successResponse('Blocked articles retrieved successfully', { articles }),
    );
  },
);

