import { Document, Model, Schema, model } from 'mongoose';
import { IArticle } from '../interfaces/article.interface';

export interface ArticleDocument extends IArticle, Document {}

const articleSchema = new Schema<ArticleDocument>(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Article description is required'],
    },
    images: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Article category is required'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Article author is required'],
    },
    // Denormalized counters kept in sync by the interaction service layer
    // (a later phase) for efficient feed/list reads without aggregating
    // the ArticleInteraction collection on every request.
    likeCount: {
      type: Number,
      default: 0,
    },
    dislikeCount: {
      type: Number,
      default: 0,
    },
    blockCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Supports the personalized feed query: articles in a given category,
// newest first.
articleSchema.index({ category: 1, createdAt: -1 });

// Supports "My Articles": all articles by a given author, newest first.
articleSchema.index({ author: 1, createdAt: -1 });

export const ArticleModel: Model<ArticleDocument> = model<ArticleDocument>(
  'Article',
  articleSchema,
);
