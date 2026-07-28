import { z } from 'zod';

export const productQuerySchema = z.object({
  search: z.string().trim().optional(),
  categoryId: z.string().optional(),
  categorySlug: z.string().optional(),
  brand: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'newest']).optional().default('newest'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export type ProductQueryInput = z.infer<typeof productQuerySchema>;
