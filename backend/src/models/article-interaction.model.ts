import { Document, Model, Schema, model } from 'mongoose';
import {
  INTERACTION_TYPES,
  IArticleInteraction,
} from '../interfaces/article-interaction.interface';

export interface ArticleInteractionDocument extends IArticleInteraction, Document {}

const articleInteractionSchema = new Schema<ArticleInteractionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },
    articleId: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      required: [true, 'articleId is required'],
    },
    interactionType: {
      type: String,
      enum: INTERACTION_TYPES,
      required: [true, 'interactionType is required'],
    },
  },
  { timestamps: true },
);

// Enforces exactly one current interaction (like / dislike / block) per
// user per article at the database level. Switching a user's reaction is
// an update to this existing document, not a new one — this is what
// makes repeated clicks idempotent instead of inflating counts.
articleInteractionSchema.index({ userId: 1, articleId: 1 }, { unique: true });

export const ArticleInteractionModel: Model<ArticleInteractionDocument> =
  model<ArticleInteractionDocument>('ArticleInteraction', articleInteractionSchema);
