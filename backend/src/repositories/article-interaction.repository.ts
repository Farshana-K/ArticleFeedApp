import { ArticleInteractionDocument, ArticleInteractionModel } from '../models/article-interaction.model';
import { IArticleInteractionRepository } from '../contracts/article-interaction.repository.interface';
import { InteractionType } from '../interfaces/article-interaction.interface';

export class ArticleInteractionRepository implements IArticleInteractionRepository {
  find(articleId: string, userId: string): Promise<ArticleInteractionDocument | null> { return ArticleInteractionModel.findOne({ articleId, userId }); }
  create(articleId: string, userId: string, interactionType: InteractionType): Promise<ArticleInteractionDocument> { return ArticleInteractionModel.create({ articleId, userId, interactionType }); }
  update(articleId: string, userId: string, interactionType: InteractionType): Promise<ArticleInteractionDocument | null> { return ArticleInteractionModel.findOneAndUpdate({ articleId, userId }, { $set: { interactionType } }, { new: true, runValidators: true }); }
  async delete(articleId: string, userId: string): Promise<void> { await ArticleInteractionModel.deleteOne({ articleId, userId }); }
  async findBlockedArticleIds(userId: string): Promise<string[]> { const interactions = await ArticleInteractionModel.find({ userId, interactionType: 'block' }).select('articleId'); return interactions.map((item) => String(item.articleId)); }
  findBlockedArticles(userId: string): Promise<ArticleInteractionDocument[]> { return ArticleInteractionModel.find({ userId, interactionType: 'block' }).populate({ path: 'articleId', populate: [{ path: 'category', select: 'name slug' }, { path: 'author', select: 'firstName lastName' }] }); }
}
 