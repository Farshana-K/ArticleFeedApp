import { Types } from 'mongoose';
import { ArticleDocument } from '../models/article.model';
export interface ArticleDTO {
  id: string; title: string; description: string; images: string[]; tags: string[];
  category: { id: string; name: string; slug: string };
  author: { id: string; firstName: string; lastName: string };
  likeCount: number; dislikeCount: number; blockCount: number;
  userInteraction: 'like' | 'dislike' | 'block' | null; createdAt: Date; updatedAt: Date;
}
export function toArticleDTO(article: ArticleDocument, userInteraction: ArticleDTO['userInteraction'] = null): ArticleDTO {
  const category = article.category as unknown as { _id: Types.ObjectId; name: string; slug: string };
  const author = article.author as unknown as { _id: Types.ObjectId; firstName: string; lastName: string };
  return { id: String(article._id), title: article.title, description: article.description, images: article.images, tags: article.tags,
    category: { id: String(category._id), name: category.name, slug: category.slug }, author: { id: String(author._id), firstName: author.firstName, lastName: author.lastName },
    likeCount: article.likeCount, dislikeCount: article.dislikeCount, blockCount: article.blockCount, userInteraction, createdAt: article.createdAt, updatedAt: article.updatedAt };
}
 