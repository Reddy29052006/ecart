import { z } from 'zod';

export const checkoutPreviewSchema = z.object({
  addressId: z.string().min(1, 'Delivery address is required'),
});

export type CheckoutPreviewInput = z.infer<typeof checkoutPreviewSchema>;
