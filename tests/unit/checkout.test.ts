import { describe, it, expect, beforeEach } from 'vitest';
import { CheckoutService } from '@/modules/checkout/checkout.service';
import { BadRequestError, NotFoundError } from '@/lib/errors/app-error';
import type { ICartRepository } from '@/modules/cart';
import type { ICustomerRepository } from '@/modules/customer';

class MockCartRepositoryForCheckout implements ICartRepository {
  public mockCart: any = null;

  async findCartByCustomerId(customerProfileId: string): Promise<any | null> {
    return this.mockCart;
  }
  async createCart(): Promise<any> { return null; }
  async findCartItem(): Promise<any | null> { return null; }
  async findCartItemById(): Promise<any | null> { return null; }
  async addCartItem(): Promise<any> { return null; }
  async updateCartItemQuantity(): Promise<any> { return null; }
  async deleteCartItem(): Promise<void> {}
  async clearCart(): Promise<void> {}
}

class MockCustomerRepositoryForCheckout implements ICustomerRepository {
  public mockProfile: any = { id: 'prof-1', userId: 'user-1' };
  public mockAddress: any = {
    id: 'addr-1',
    customerProfileId: 'prof-1',
    fullName: 'John Doe',
    phone: '+1234567890',
    addressLine1: '123 Main St',
    addressLine2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'USA',
  };

  async findProfileByUserId(userId: string): Promise<any | null> {
    return this.mockProfile;
  }
  async upsertProfile(userId: string, data: any): Promise<any> {
    this.mockProfile = { id: 'prof-1', userId, ...data };
    return this.mockProfile;
  }
  async findAddressById(addressId: string, userId: string): Promise<any | null> {
    if (this.mockAddress && this.mockAddress.id === addressId) {
      return this.mockAddress;
    }
    return null;
  }
  async findAddressesByUserId(userId: string): Promise<any[]> { return []; }
  async createAddress(): Promise<any> { return {}; }
  async updateAddress(): Promise<any> { return {}; }
  async deleteAddress(): Promise<void> {}
  async setDefaultAddress(): Promise<any> { return {}; }
}

describe('CheckoutService — 8-Gate Validation Pipeline Tests', () => {
  let checkoutService: CheckoutService;
  let cartRepo: MockCartRepositoryForCheckout;
  let customerRepo: MockCustomerRepositoryForCheckout;

  beforeEach(() => {
    cartRepo = new MockCartRepositoryForCheckout();
    customerRepo = new MockCustomerRepositoryForCheckout();
    checkoutService = new CheckoutService(cartRepo, customerRepo);
  });

  function createValidCart() {
    return {
      id: 'cart-1',
      customerProfileId: 'prof-1',
      items: [
        {
          id: 'ci-1',
          quantity: 2,
          variant: {
            id: 'v-1',
            sku: 'SKU-001',
            price: 50.0,
            status: 'ACTIVE',
            product: {
              id: 'p-1',
              name: 'Sample Product',
              status: 'ACTIVE',
              vendor: { id: 'vend-1', status: 'ACTIVE' },
              images: [{ url: 'http://img.png', isPrimary: true }],
            },
            attributes: [{ name: 'Color', value: 'Blue' }],
            inventory: { availableQuantity: 10, reservedQuantity: 0 },
          },
        },
      ],
    };
  }

  it('Gate 1 & 2 & 3–8: Should successfully generate order preview when all 8 gates pass', async () => {
    cartRepo.mockCart = createValidCart();

    const preview = await checkoutService.previewOrder('user-1', { addressId: 'addr-1' });

    expect(preview.isReadyForOrder).toBe(true);
    expect(preview.items).toHaveLength(1);
    expect(preview.items[0].unitPrice).toBe(50.0);
    expect(preview.items[0].totalPrice).toBe(100.0);
    expect(preview.pricing.subtotal).toBe(100.0);
    expect(preview.pricing.taxAmount).toBe(0);
    expect(preview.pricing.shippingAmount).toBe(0);
    expect(preview.pricing.grandTotal).toBe(100.0);
    expect(preview.deliveryAddress.fullName).toBe('John Doe');
  });

  it('Gate 2: Should fail preview when delivery address is not found or invalid', async () => {
    cartRepo.mockCart = createValidCart();

    await expect(
      checkoutService.previewOrder('user-1', { addressId: 'non-existent-address' })
    ).rejects.toThrow(NotFoundError);
  });

  it('Gate 3: Should fail preview when cart is empty or null', async () => {
    cartRepo.mockCart = { id: 'cart-1', items: [] };

    await expect(
      checkoutService.previewOrder('user-1', { addressId: 'addr-1' })
    ).rejects.toThrow(BadRequestError);
  });

  it('Gate 4: Should fail preview when product status is not ACTIVE', async () => {
    const cart = createValidCart();
    cart.items[0].variant.product.status = 'DRAFT';
    cartRepo.mockCart = cart;

    await expect(
      checkoutService.previewOrder('user-1', { addressId: 'addr-1' })
    ).rejects.toThrow(BadRequestError);
  });

  it('Gate 5: Should fail preview when variant status is not ACTIVE', async () => {
    const cart = createValidCart();
    cart.items[0].variant.status = 'INACTIVE';
    cartRepo.mockCart = cart;

    await expect(
      checkoutService.previewOrder('user-1', { addressId: 'addr-1' })
    ).rejects.toThrow(BadRequestError);
  });

  it('Gate 6: Should fail preview when vendor status is not ACTIVE', async () => {
    const cart = createValidCart();
    cart.items[0].variant.product.vendor.status = 'SUSPENDED';
    cartRepo.mockCart = cart;

    await expect(
      checkoutService.previewOrder('user-1', { addressId: 'addr-1' })
    ).rejects.toThrow(BadRequestError);
  });

  it('Gate 7: Should enforce server-side price integrity (unitPrice calculated from DB variant price)', async () => {
    const cart = createValidCart();
    cart.items[0].variant.price = 75.5; // Database variant price
    cartRepo.mockCart = cart;

    const preview = await checkoutService.previewOrder('user-1', { addressId: 'addr-1' });
    expect(preview.items[0].unitPrice).toBe(75.5);
    expect(preview.items[0].totalPrice).toBe(151.0);
  });

  it('Gate 8: Should fail preview when available stock is insufficient', async () => {
    const cart = createValidCart();
    cart.items[0].quantity = 10;
    cart.items[0].variant.inventory = { availableQuantity: 5, reservedQuantity: 2 }; // sellable = 3
    cartRepo.mockCart = cart;

    await expect(
      checkoutService.previewOrder('user-1', { addressId: 'addr-1' })
    ).rejects.toThrow(BadRequestError);
  });
});
