import { z } from 'zod';

export const createArticleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  tags: z.string().trim(),
  images: z
    .array(z.instanceof(File))
    .max(5, 'You can upload up to 5 images'),
});

export type CreateArticleFormData = z.infer<typeof createArticleSchema>;