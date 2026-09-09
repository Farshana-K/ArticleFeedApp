import { Types } from 'mongoose';

export interface IArticle {
  title: string;
  description: string;
  images: string[];
  tags: string[];
  category: Types.ObjectId;
  author: Types.ObjectId;
  likeCount: number;
  dislikeCount: number;
  blockCount: number;
  createdAt: Date;
  updatedAt: Date;
}
