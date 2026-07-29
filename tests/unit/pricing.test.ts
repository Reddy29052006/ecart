import { describe, it, expect } from 'vitest';
import { PricingService } from '@/modules/pricing/pricing.service';

describe('PricingService — Calculations & Edge Cases', () => {
  it('should calculate subtotal, taxAmount, shippingAmount, and grandTotal correctly for standard items', () => {
    const pricingService = new PricingService({
      taxRate: 0.1, // 10%
      shippingAmount: 15,
    });

    const items = [
      { variantId: 'v1', unitPrice: 100, quantity: 2 }, // 200
      { variantId: 'v2', unitPrice: 50, quantity: 1 },  // 50
    ];

    const result = pricingService.calculate(items);

    expect(result.subtotal).toBe(250);
    expect(result.taxAmount).toBe(25); // 10% tax on 250
    expect(result.shippingAmount).toBe(15);
    expect(result.discountAmount).toBe(0);
    expect(result.grandTotal).toBe(290); // 250 + 25 + 15 = 290
  });

  it('should handle empty cart items array cleanly with zero totals', () => {
    const pricingService = new PricingService();
    const result = pricingService.calculate([]);

    expect(result.subtotal).toBe(0);
    expect(result.taxAmount).toBe(0);
    expect(result.shippingAmount).toBe(0);
    expect(result.discountAmount).toBe(0);
    expect(result.grandTotal).toBe(0);
  });

  it('should calculate custom tax rate and discount options correctly', () => {
    const pricingService = new PricingService({
      taxRate: 0.05, // 5%
      shippingAmount: 20,
    });

    const items = [{ variantId: 'v1', unitPrice: 100, quantity: 1 }];
    const result = pricingService.calculate(items, 10); // 10 discount

    expect(result.subtotal).toBe(100);
    expect(result.discountAmount).toBe(10);
    expect(result.taxAmount).toBe(5); // 5% of 100
    expect(result.shippingAmount).toBe(20);
    expect(result.grandTotal).toBe(115); // 100 + 20 + 5 - 10 = 115
  });

  it('should handle free shipping threshold when subtotal exceeds limit', () => {
    const pricingService = new PricingService({
      taxRate: 0,
      shippingAmount: 50,
      freeShippingThreshold: 200,
    });

    const items = [{ variantId: 'v1', unitPrice: 250, quantity: 1 }];
    const result = pricingService.calculate(items);

    expect(result.subtotal).toBe(250);
    expect(result.shippingAmount).toBe(0); // Free shipping threshold met
    expect(result.grandTotal).toBe(250);
  });
});
