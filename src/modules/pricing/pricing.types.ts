// Pricing Module — Domain Types

export interface PricingConfig {
  taxRate: number;          // e.g. 0.18 for 18% GST (0 for now)
  shippingAmount: number;   // flat rate shipping cost (0 for now)
  freeShippingThreshold: number | null; // min subtotal for free shipping (null = always charge)
}

export interface PricingLineItem {
  variantId: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface PricingBreakdown {
  lineItems: PricingLineItem[];
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  currency: string;
}
