import type { PricingBreakdown } from '@/modules/pricing';

// A single validated line item in the order preview
export interface CheckoutItem {
  cartItemId: string;
  variantId: string;
  productId: string;
  vendorId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  variantAttributes: { name: string; value: string }[];
  productImage: string | null;
}

// Snapshot of the delivery address at checkout time
export interface AddressSnapshot {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Full order preview returned to customer before confirming
export interface OrderPreview {
  items: CheckoutItem[];
  pricing: PricingBreakdown;
  deliveryAddress: AddressSnapshot;
  isReadyForOrder: boolean;
}
