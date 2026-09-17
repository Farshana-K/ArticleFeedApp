import { ArticleInteractionDocument } from "../models/article-interaction.model";
import { InteractionType } from "../interfaces/article-interaction.interface";
export interface IArticleInteractionRepository {
  find(
    articleId: string,
    userId: string,
  ): Promise<ArticleInteractionDocument | null>;
  create(
    articleId: string,
    userId: string,
    interactionType: InteractionType,
  ): Promise<ArticleInteractionDocument>;
  update(
    articleId: string,
    userId: string,
    interactionType: InteractionType,
  ): Promise<ArticleInteractionDocument | null>;
  delete(articleId: string, userId: string): Promise<void>;
  findBlockedArticleIds(userId: string): Promise<string[]>;
  findBlockedArticles(userId: string): Promise<ArticleInteractionDocument[]>;
}
 