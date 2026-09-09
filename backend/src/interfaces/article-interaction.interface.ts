import { Types } from 'mongoose';

// Fixed system-level set of interaction states (not user/database-managed
// data like Category), so a const-array-derived union type is appropriate
// here rather than a hardcoded TypeScript enum of business categories.
export const INTERACTION_TYPES = ['like', 'dislike', 'block'] as const;

export type InteractionType = (typeof INTERACTION_TYPES)[number];

export interface IArticleInteraction {
  userId: Types.ObjectId;
  articleId: Types.ObjectId;
  interactionType: InteractionType;
  createdAt: Date;
  updatedAt: Date;
}
