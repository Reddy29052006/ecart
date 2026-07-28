import { z } from 'zod';

const variantAttributeSchema = z.object({
  name: z.string().trim().min(1, 'Attribute name is required').max(50),
  value: z.string().trim().min(1, 'Attribute value is required').max(100),
});

export const createVariantSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(2, 'SKU must be at least 2 characters')
    .max(100)
    .regex(/^[A-Z0-9_-]+$/i, 'SKU can only contain letters, numbers, dashes, and underscores'),
  price: z.number().min(0, 'Price must be non-negative'),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
  lowStockThreshold: z.number().int().min(0).optional().default(5),
  attributes: z.array(variantAttributeSchema).optional().default([]),
});

export const updateVariantSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[A-Z0-9_-]+$/i)
    .optional(),
  price: z.number().min(0).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
});

export const addStockSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  note: z.string().trim().max(500).optional(),
  referenceType: z.string().trim().max(50).optional(),
  referenceId: z.string().trim().max(100).optional(),
});

export const adjustStockSchema = z.object({
  quantity: z.number().int({ message: 'Quantity must be an integer' }),
  note: z.string().trim().max(500).optional(),
});

export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
export type AddStockInput = z.infer<typeof addStockSchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
