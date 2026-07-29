import type { PricingBreakdown, PricingConfig, PricingLineItem } from './pricing.types';

// Default pricing config — all rates are 0 initially.
// To add GST: set taxRate to 0.18.
// To add flat shipping: set shippingAmount to a positive number.
// To add free-shipping threshold: set freeShippingThreshold to minimum subtotal.
const DEFAULT_CONFIG: PricingConfig = {
  taxRate: 0,
  shippingAmount: 0,
  freeShippingThreshold: null,
};

export class PricingService {
  private readonly config: PricingConfig;

  constructor(config: Partial<PricingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Calculate a complete price breakdown from a list of cart items.
  // Each item only needs variantId, unitPrice, and quantity — no cart dependency.
  calculate(
    items: { variantId: string; unitPrice: number; quantity: number }[],
    discountAmount = 0
  ): PricingBreakdown {
    const lineItems: PricingLineItem[] = items.map((item) => ({
      variantId: item.variantId,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      totalPrice: parseFloat((item.unitPrice * item.quantity).toFixed(2)),
    }));

    const subtotal = parseFloat(
      lineItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)
    );

    // Shipping is free if subtotal meets the threshold, otherwise use flat rate
    const shipping =
      this.config.freeShippingThreshold !== null && subtotal >= this.config.freeShippingThreshold
        ? 0
        : this.config.shippingAmount;

    const taxAmount = parseFloat((subtotal * this.config.taxRate).toFixed(2));
    const grandTotal = parseFloat(
      (subtotal + shipping + taxAmount - discountAmount).toFixed(2)
    );

    return {
      lineItems,
      subtotal,
      shippingAmount: shipping,
      taxAmount,
      discountAmount,
      grandTotal,
      currency: 'INR',
    };
  }
}
