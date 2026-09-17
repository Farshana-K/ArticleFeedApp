import { ArticleDocument } from "../models/article.model";
export interface CreateArticleInput {
  title: string;
  description: string;
  images: string[];
  tags: string[];
  category: string;
  author: string;
}
export interface UpdateArticleInput {
  title?: string;
  description?: string;
  images?: string[];
  tags?: string[];
  category?: string;
}
export type InteractionCounterField =
  | "likeCount"
  | "dislikeCount"
  | "blockCount";
export interface IArticleRepository {
  create(input: CreateArticleInput): Promise<ArticleDocument>;
  findAll(): Promise<ArticleDocument[]>;
  findById(id: string): Promise<ArticleDocument | null>;
  findByIdAndAuthor(
    id: string,
    authorId: string,
  ): Promise<ArticleDocument | null>;
  updateByAuthor(
    id: string,
    authorId: string,
    updates: UpdateArticleInput,
  ): Promise<ArticleDocument | null>;
  deleteByAuthor(id: string, authorId: string): Promise<ArticleDocument | null>;
  findByCategories(categoryIds: string[]): Promise<ArticleDocument[]>;
  findByAuthor(authorId: string): Promise<ArticleDocument[]>;
  incrementInteractionCounters(
    articleId: string,
    changes: Partial<Record<InteractionCounterField, number>>,
  ): Promise<void>;
}
