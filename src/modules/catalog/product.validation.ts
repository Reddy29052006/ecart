import { z } from 'zod';

export const createProductSchema = z.object({
  categoryId: z.string().cuid('Invalid category ID'),
  name: z.string().trim().min(3, 'Product name must be at least 3 characters').max(150),
  description: z.string().trim().max(2000).optional(),
  brand: z.string().trim().max(100).optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  stock: z.number().int().min(0, 'Stock must be non-negative').optional().default(0),
});

export const updateProductSchema = createProductSchema.partial();

export const updateProductStatusSchema = z.object({
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'], {
    required_error: 'Product status is required',
  }),
});

export const addProductImageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  sortOrder: z.number().int().min(0).optional().default(0),
  isPrimary: z.boolean().optional().default(false),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type UpdateProductStatusInput = z.infer<typeof updateProductStatusSchema>;
export type AddProductImageInput = z.infer<typeof addProductImageSchema>;
