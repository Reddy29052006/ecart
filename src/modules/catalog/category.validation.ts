import { z } from 'zod';

export const createCategorySchema = z.object({
  parentCategoryId: z.string().cuid('Invalid parent category ID').optional(),
  name: z.string().trim().min(2, 'Category name must be at least 2 characters').max(100),
  description: z.string().trim().max(500).optional(),
  image: z.string().url('Invalid image URL').optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
