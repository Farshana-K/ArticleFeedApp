import type { Category } from './category.types';

export interface Article {
  id: string;
  title: string;
  description: string;
  images: string[];
  tags: string[];
  category: Category;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  likeCount: number;
  dislikeCount: number;
  blockCount: number;
  userInteraction: 'like' | 'dislike' | 'block' | null;
  createdAt: string;
  updatedAt: string;
}