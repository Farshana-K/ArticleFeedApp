import { Types } from 'mongoose';
import { BadRequestError, NotFoundError } from '../errors/app.error';
import { CategoryModel } from '../models/category.model';
import { ArticleDocument } from '../models/article.model';
import {
  createArticle,
  deleteArticle,
  findArticleById,
  findArticleByIdAndAuthor,
  findArticles,
  findArticlesByAuthor,
  findArticlesByCategories,
  updateArticle,
} from '../repositories/article.repository';
import {
  CreateArticleRequestDTO,
  UpdateArticleRequestDTO,
} from '../validators/article.validator';
import { findBlockedArticleIds, findInteraction } from '../repositories/article-interaction.repository';

export interface ArticleDTO {
  id: string;
  title: string;
  description: string;
  images: string[];
  tags: string[];
  category: { id: string; name: string; slug: string };
  author: { id: string; firstName: string; lastName: string };
  likeCount: number;
  dislikeCount: number;
  blockCount: number;
  userInteraction: 'like' | 'dislike' | 'block' | null;
  createdAt: Date;
  updatedAt: Date;
}

function toArticleDTO(
  article: ArticleDocument,
  userInteraction: ArticleDTO['userInteraction'] = null,
): ArticleDTO {
  const category = article.category as unknown as {
    _id: Types.ObjectId;
    name: string;
    slug: string;
  };

  const author = article.author as unknown as {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
  };

  return {
    id: String(article._id),
    title: article.title,
    description: article.description,
    images: article.images,
    tags: article.tags,
    category: {
      id: String(category._id),
      name: category.name,
      slug: category.slug,
    },
    author: {
      id: String(author._id),
      firstName: author.firstName,
      lastName: author.lastName,
    },
    likeCount: article.likeCount,
    dislikeCount: article.dislikeCount,
    blockCount: article.blockCount,
    userInteraction,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  };
}

function validateArticleId(id: string): void {
  if (!Types.ObjectId.isValid(id)) {
    throw new NotFoundError('Article not found');
  }
}

async function validateCategory(categoryId: string): Promise<void> {
  if (!Types.ObjectId.isValid(categoryId)) {
    throw new BadRequestError('Invalid category ID');
  }

  const category = await CategoryModel.findOne({
    _id: categoryId,
    isActive: true,
  });

  if (!category) {
    throw new BadRequestError('Category not found or inactive');
  }
}

export async function createNewArticle(
  userId: string,
  input: CreateArticleRequestDTO,
): Promise<ArticleDTO> {
  await validateCategory(input.category);

  const article = await createArticle({
    ...input,
    author: userId,
  });

  return toArticleDTO(
    (await findArticleById(String(article._id))) as ArticleDocument,
  );
}

export async function getAllArticles(): Promise<ArticleDTO[]> {
  const articles = await findArticles();
  return articles.map((article) => toArticleDTO(article));
}

export async function getArticle(id: string): Promise<ArticleDTO> {
  validateArticleId(id);

  const article = await findArticleById(id);

  if (!article) {
    throw new NotFoundError('Article not found');
  }

  return toArticleDTO(article);
}

export async function updateOwnArticle(
  id: string,
  userId: string,
  input: UpdateArticleRequestDTO,
): Promise<ArticleDTO> {
  validateArticleId(id);

  if (input.category) {
    await validateCategory(input.category);
  }

  const article = await findArticleByIdAndAuthor(id, userId);

  if (!article) {
    throw new NotFoundError('Article not found');
  }

  const updatedArticle = await updateArticle(id, userId, input);

  if (!updatedArticle) {
    throw new NotFoundError('Article not found');
  }

  return toArticleDTO(updatedArticle);
}

export async function deleteOwnArticle(
  id: string,
  userId: string,
): Promise<void> {
  validateArticleId(id);

  const article = await deleteArticle(id, userId);

  if (!article) {
    throw new NotFoundError('Article not found');
  }
}

export async function getPersonalizedArticles(
  categoryIds: string[],
  userId: string,
): Promise<ArticleDTO[]> {
  if (!categoryIds.length) return [];

  const [articles, blockedIds] = await Promise.all([
    findArticlesByCategories(categoryIds),
    findBlockedArticleIds(userId),
  ]);

  const visibleArticles = articles.filter(
    (article) => !blockedIds.includes(String(article._id)),
  );

  return Promise.all(
    visibleArticles.map(async (article) => {
      const interaction = await findInteraction(String(article._id), userId);

      return toArticleDTO(
        article,
        interaction?.interactionType as ArticleDTO['userInteraction'] ?? null,
      );
    }),
  );
}

export async function getMyArticles(userId: string): Promise<ArticleDTO[]> {
  const articles = await findArticlesByAuthor(userId);
  return articles.map((article) => toArticleDTO(article));
}

