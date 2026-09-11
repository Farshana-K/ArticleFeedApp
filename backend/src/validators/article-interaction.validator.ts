import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid article ID');

export const articleInteractionSchema = z.object({
  interactionType: z.enum(['like', 'dislike', 'block']),
}).strict();

export const articleInteractionRequestSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: articleInteractionSchema,
});

export type ArticleInteractionDTO = z.infer<typeof articleInteractionSchema>;