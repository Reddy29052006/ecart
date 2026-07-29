import { z } from 'zod';

// Customer Module — Zod Validation Schemas

export const updateCustomerProfileSchema = z.object({
  firstName: z.string().trim().max(50).optional(),
  lastName: z.string().trim().max(50).optional(),
  displayName: z.string().trim().max(50).optional(),
  profileImage: z.string().url('Invalid profile image URL').optional().or(z.literal('')),
});

export const createAddressSchema = z.object({
  label: z.string().trim().max(30).optional(),
  fullName: z.string().trim().min(2, 'Full name is required'),
  phone: z.string().trim().regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number format'),
  addressLine1: z.string().trim().min(5, 'Address line 1 is required'),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  postalCode: z.string().trim().min(3, 'Postal code is required'),
  country: z.string().trim().default('IN'),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();

export type UpdateCustomerProfileInput = z.infer<typeof updateCustomerProfileSchema>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
