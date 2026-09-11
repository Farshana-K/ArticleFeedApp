import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID');

const articleBodySchema = z.object({
  title: z.string().trim().min(3, 'Article title must be at least 3 characters').max(200, 'Article title must not exceed 200 characters'),
  description: z.string().trim().min(10, 'Article description must be at least 10 characters'),
  images: z.array(z.string().url('Each image must be a valid URL')).default([]),
  tags: z.array(z.string().trim().min(1, 'Tag cannot be empty')).default([]),
  category: objectIdSchema,
}).strict();

const updateArticleBodySchema = articleBodySchema.partial();

export const articleIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const createArticleRequestSchema = z.object({
  body: articleBodySchema,
});

export const updateArticleRequestSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: updateArticleBodySchema,
});

export type CreateArticleRequestDTO = z.infer<typeof articleBodySchema>;
export type UpdateArticleRequestDTO = z.infer<typeof updateArticleBodySchema>;