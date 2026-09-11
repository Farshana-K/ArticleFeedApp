import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID');

const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'Category name must be at least 2 characters').max(50, 'Category name must not exceed 50 characters'),
}).strict();

const updateCategorySchema = z.object({
  name: z.string().trim().min(2, 'Category name must be at least 2 characters').max(50, 'Category name must not exceed 50 characters').optional(),
  isActive: z.boolean().optional(),
}).strict();

const updateCategoryStatusSchema = z.object({
  isActive: z.boolean(),
}).strict();

export const categoryIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const createCategoryRequestSchema = z.object({
  body: createCategorySchema,
});

export const updateCategoryRequestSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: updateCategorySchema,
});

export const updateCategoryStatusRequestSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: updateCategoryStatusSchema,
});

export type CreateCategoryRequestDTO = z.infer<typeof createCategorySchema>;
export type UpdateCategoryRequestDTO = z.infer<typeof updateCategorySchema>;
export type UpdateCategoryStatusRequestDTO = z.infer<typeof updateCategoryStatusSchema>;