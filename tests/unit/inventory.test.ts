import { describe, it, expect } from 'vitest';

describe('Inventory & Stock Business Rules', () => {
  function computeSellableQuantity(availableQuantity: number, reservedQuantity: number): number {
    return Math.max(0, availableQuantity - reservedQuantity);
  }

  function validateItemStock(
    requestedQty: number,
    availableQty: number,
    reservedQty: number,
    productStatus: string,
    variantStatus: string
  ): { isAvailable: boolean; validationError?: string } {
    if (productStatus !== 'ACTIVE') {
      return { isAvailable: false, validationError: 'Product is inactive or unpublished' };
    }
    if (variantStatus !== 'ACTIVE') {
      return { isAvailable: false, validationError: 'Variant is inactive or no longer available' };
    }

    const sellable = computeSellableQuantity(availableQty, reservedQty);
    if (sellable < requestedQty) {
      return {
        isAvailable: false,
        validationError: `Insufficient stock (Requested: ${requestedQty}, Available: ${sellable})`,
      };
    }

    return { isAvailable: true };
  }

  it('should calculate sellable quantity correctly', () => {
    expect(computeSellableQuantity(10, 2)).toBe(8);
    expect(computeSellableQuantity(5, 5)).toBe(0);
    expect(computeSellableQuantity(3, 10)).toBe(0); // non-negative floor
  });

  it('should validate sufficient stock for active product and variant', () => {
    const res = validateItemStock(2, 10, 1, 'ACTIVE', 'ACTIVE');
    expect(res.isAvailable).toBe(true);
    expect(res.validationError).toBeUndefined();
  });

  it('should reject when requested quantity exceeds sellable stock', () => {
    const res = validateItemStock(5, 10, 8, 'ACTIVE', 'ACTIVE');
    expect(res.isAvailable).toBe(false);
    expect(res.validationError).toContain('Insufficient stock');
  });

  it('should reject when product status is DRAFT or INACTIVE', () => {
    const res = validateItemStock(1, 10, 0, 'DRAFT', 'ACTIVE');
    expect(res.isAvailable).toBe(false);
    expect(res.validationError).toContain('Product is inactive');
  });

  it('should reject when variant status is INACTIVE', () => {
    const res = validateItemStock(1, 10, 0, 'ACTIVE', 'INACTIVE');
    expect(res.isAvailable).toBe(false);
    expect(res.validationError).toContain('Variant is inactive');
  });
});
