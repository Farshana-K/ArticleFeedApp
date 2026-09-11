import { Types } from 'mongoose';
import { NotFoundError } from '../errors/app.error';
import { ArticleModel } from '../models/article.model';
import {
  createInteraction,
  deleteInteraction,
  findBlockedArticles,
  findInteraction,
  updateInteraction,
} from '../repositories/article-interaction.repository';
import { ArticleInteractionDTO } from '../validators/article-interaction.validator';

type InteractionType = 'like' | 'dislike' | 'block';

const counterFields: Record<
  InteractionType,
  'likeCount' | 'dislikeCount' | 'blockCount'
> = {
  like: 'likeCount',
  dislike: 'dislikeCount',
  block: 'blockCount',
};

export async function setArticleInteraction(
  articleId: string,
  userId: string,
  input: ArticleInteractionDTO,
): Promise<{ likeCount: number; dislikeCount: number; blockCount: number }> {
  if (!Types.ObjectId.isValid(articleId)) {
    throw new NotFoundError('Article not found');
  }

  const article = await ArticleModel.findById(articleId);
  if (!article) throw new NotFoundError('Article not found');

  const existing = await findInteraction(articleId, userId);
  const newType = input.interactionType as InteractionType;

  if (existing?.interactionType === newType) {
    return {
      likeCount: article.likeCount,
      dislikeCount: article.dislikeCount,
      blockCount: article.blockCount,
    };
  }

  if (existing) {
    const oldField = counterFields[existing.interactionType as InteractionType];
    const newField = counterFields[newType];

    await ArticleModel.updateOne(
      { _id: articleId },
      { $inc: { [oldField]: -1, [newField]: 1 } },
    );

    await updateInteraction(articleId, userId, newType);
  } else {
    await ArticleModel.updateOne(
      { _id: articleId },
      { $inc: { [counterFields[newType]]: 1 } },
    );

    await createInteraction(articleId, userId, newType);
  }

  const updatedArticle = await ArticleModel.findById(articleId);

  return {
    likeCount: updatedArticle?.likeCount ?? 0,
    dislikeCount: updatedArticle?.dislikeCount ?? 0,
    blockCount: updatedArticle?.blockCount ?? 0,
  };
}

export async function removeArticleInteraction(
  articleId: string,
  userId: string,
): Promise<void> {
  if (!Types.ObjectId.isValid(articleId)) {
    throw new NotFoundError('Article not found');
  }

  const article = await ArticleModel.findById(articleId);
  if (!article) throw new NotFoundError('Article not found');

  const existing = await findInteraction(articleId, userId);
  if (!existing) return;

  const interactionType = existing.interactionType as InteractionType;

  await ArticleModel.updateOne(
    { _id: articleId },
    { $inc: { [counterFields[interactionType]]: -1 } },
  );

  await deleteInteraction(articleId, userId);
}

export async function getBlockedArticles(userId: string) {
  return findBlockedArticles(userId);
}

