import { z } from 'zod';

// Vendor Module — Zod Validation Schemas

export const updateVendorProfileSchema = z.object({
  businessName: z.string().trim().min(2, 'Business name must be at least 2 characters').max(100).optional(),
  businessDescription: z.string().trim().max(1000).optional(),
  businessPhone: z.string().trim().regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number format').optional(),
  businessEmail: z.string().email('Invalid email address').optional(),
  logo: z.string().url('Invalid logo URL').optional().or(z.literal('')),
});

export const updateVendorStatusSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED'], { required_error: 'Valid vendor status is required' }),
});

export type UpdateVendorProfileInput = z.infer<typeof updateVendorProfileSchema>;
export type UpdateVendorStatusInput = z.infer<typeof updateVendorStatusSchema>;
