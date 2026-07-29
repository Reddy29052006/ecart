import { z } from 'zod';

export const placeOrderSchema = z.object({
  addressId: z.string().min(1, 'Delivery address is required'),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
