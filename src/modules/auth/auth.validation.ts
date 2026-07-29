import { z } from 'zod';

// Auth Module — Zod Validation Schemas

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const emailSchema = z.string().email('Invalid email address').toLowerCase();

const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number format')
  .optional();

export const registerCustomerSchema = z.object({
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
});

export const registerVendorSchema = z.object({
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const selectRoleSchema = z.object({
  selectionToken: z.string().min(1, 'Selection token is required'),
  role: z.enum(['CUSTOMER', 'VENDOR'], { required_error: 'Valid role is required' }),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RegisterCustomerInput = z.infer<typeof registerCustomerSchema>;
export type RegisterVendorInput = z.infer<typeof registerVendorSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SelectRoleInput = z.infer<typeof selectRoleSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
