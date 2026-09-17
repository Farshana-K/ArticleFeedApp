import { Types } from 'mongoose';
import { NotFoundError } from '../errors/app.error';
import { IArticleRepository } from '../contracts/article.repository.interface';
import { IArticleInteractionRepository } from '../contracts/article-interaction.repository.interface';
import { InteractionType } from '../interfaces/article-interaction.interface';
import { ArticleInteractionDTO } from '../validators/article-interaction.validator';

const counterFields: Record<InteractionType, 'likeCount' | 'dislikeCount' | 'blockCount'> = { like: 'likeCount', dislike: 'dislikeCount', block: 'blockCount' };
export class ArticleInteractionService {
  constructor(private readonly articles: IArticleRepository, private readonly interactions: IArticleInteractionRepository) {}
  async set(articleId: string, userId: string, input: ArticleInteractionDTO): Promise<{ likeCount: number; dislikeCount: number; blockCount: number }> {
    if (!Types.ObjectId.isValid(articleId)) throw new NotFoundError('Article not found');
    const article = await this.articles.findById(articleId); if (!article) throw new NotFoundError('Article not found');
    const existing = await this.interactions.find(articleId, userId); const newType = input.interactionType as InteractionType;
    if (existing?.interactionType === newType) return { likeCount: article.likeCount, dislikeCount: article.dislikeCount, blockCount: article.blockCount };
    if (existing) {
      await this.articles.incrementInteractionCounters(articleId, { [counterFields[existing.interactionType]]: -1, [counterFields[newType]]: 1 });
      await this.interactions.update(articleId, userId, newType);
    } else {
      await this.articles.incrementInteractionCounters(articleId, { [counterFields[newType]]: 1 });
      await this.interactions.create(articleId, userId, newType);
    } 
    const updated = await this.articles.findById(articleId);
    return { likeCount: updated?.likeCount ?? 0, dislikeCount: updated?.dislikeCount ?? 0, blockCount: updated?.blockCount ?? 0 };
  }
  async remove(articleId: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(articleId)) throw new NotFoundError('Article not found');
    const article = await this.articles.findById(articleId); if (!article) throw new NotFoundError('Article not found');
    const existing = await this.interactions.find(articleId, userId); if (!existing) return;
    await this.articles.incrementInteractionCounters(articleId, { [counterFields[existing.interactionType]]: -1 });
    await this.interactions.delete(articleId, userId);
  }
  getBlocked(userId: string) { return this.interactions.findBlockedArticles(userId); }
}
