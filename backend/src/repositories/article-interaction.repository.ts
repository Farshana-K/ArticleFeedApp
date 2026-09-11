import {
  ArticleInteractionDocument,
  ArticleInteractionModel,
} from '../models/article-interaction.model';

export async function findInteraction(
  articleId: string,
  userId: string,
): Promise<ArticleInteractionDocument | null> {
  return ArticleInteractionModel.findOne({ articleId, userId });
}

export async function createInteraction(
  articleId: string,
  userId: string,
  interactionType: string,
): Promise<ArticleInteractionDocument> {
  return ArticleInteractionModel.create({ articleId, userId, interactionType });
}

export async function updateInteraction(
  articleId: string,
  userId: string,
  interactionType: string,
): Promise<ArticleInteractionDocument | null> {
  return ArticleInteractionModel.findOneAndUpdate(
    { articleId, userId },
    { $set: { interactionType } },
    { new: true, runValidators: true },
  );
}

export async function deleteInteraction(
  articleId: string,
  userId: string,
): Promise<void> {
  await ArticleInteractionModel.deleteOne({ articleId, userId });
}

export async function findBlockedArticleIds(userId: string): Promise<string[]> {
  const interactions = await ArticleInteractionModel.find({
    userId,
    interactionType: 'block',
  }).select('articleId');

  return interactions.map((interaction) => String(interaction.articleId));
}

export async function findBlockedArticles(
  userId: string,
): Promise<ArticleInteractionDocument[]> {
  return ArticleInteractionModel.find({
    userId,
    interactionType: 'block',
  }).populate({
    path: 'articleId',
    populate: [
      { path: 'category', select: 'name slug' },
      { path: 'author', select: 'firstName lastName' },
    ],
  });
}

