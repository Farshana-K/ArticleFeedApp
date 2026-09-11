import { Router } from 'express';
import {
  createArticle,
  deleteArticle,
  getArticleById,
  getArticles,
  getMyArticlesController,
  getPersonalizedFeed,
  updateArticle,
} from '../controllers/article.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateBody, validateParams } from '../middlewares/validate.middleware';
import {
  articleIdSchema,
  createArticleRequestSchema,
  updateArticleRequestSchema,
} from '../validators/article.validator';
import {
    getBlockedArticlesController,
  interactWithArticle,
  removeArticleInteractionController,
} from '../controllers/article-interaction.controller';
import { articleInteractionRequestSchema } from '../validators/article-interaction.validator';
import { uploadArticleImage } from '../controllers/upload.controller';
import { uploadImageMiddleware } from '../middlewares/upload.middleware';

const router = Router();

router.get('/', requireAuth, getArticles);
router.get('/feed', requireAuth, getPersonalizedFeed);
router.get('/my', requireAuth, getMyArticlesController);

router.post(
  '/upload-image',
  requireAuth,
  uploadImageMiddleware.array('images', 5),
  uploadArticleImage,
);

router.get(
  '/blocked',
  requireAuth,
  getBlockedArticlesController,
);

router.get(
  '/:id',
  requireAuth,
  validateParams(articleIdSchema.shape.params),
  getArticleById,
);

router.post(
  '/',
  requireAuth,
  validateBody(createArticleRequestSchema.shape.body),
  createArticle,
);

router.put(
  '/:id',
  requireAuth,
  validateParams(updateArticleRequestSchema.shape.params),
  validateBody(updateArticleRequestSchema.shape.body),
  updateArticle,
);

router.post(
  '/:id/interaction',
  requireAuth,
  validateParams(articleInteractionRequestSchema.shape.params),
  validateBody(articleInteractionRequestSchema.shape.body),
  interactWithArticle,
);

router.delete(
  '/:id/interaction',
  requireAuth,
  validateParams(articleIdSchema.shape.params),
  removeArticleInteractionController,
);

router.delete(
  '/:id',
  requireAuth,
  validateParams(articleIdSchema.shape.params),
  deleteArticle,
);

export default router;

