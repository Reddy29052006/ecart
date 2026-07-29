import { z } from 'zod';

export const rejectVendorOrderSchema = z.object({
  reason: z.string().min(3, 'Rejection reason must be at least 3 characters long'),
});

export const vendorOrderQuerySchema = z.object({
  status: z.enum([
    'NEW',
    'ACCEPTED',
    'PROCESSING',
    'READY',
    'SHIPPED',
    'COMPLETED',
    'REJECTED',
    'CANCELLED',
  ]).optional(),
});
