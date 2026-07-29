import { describe, it, expect, beforeEach } from 'vitest';
import { CartService } from '@/modules/cart/cart.service';
import type { ICartRepository } from '@/modules/cart';
import type { ICustomerRepository } from '@/modules/customer';
import { NotFoundError } from '@/lib/errors/app-error';

class MockCartRepository implements ICartRepository {
  public cart: any = {
    id: 'cart-1',
    customerProfileId: 'profile-1',
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  async findCartByCustomerId(customerProfileId: string): Promise<any | null> {
    if (this.cart.customerProfileId === customerProfileId) return this.cart;
    return null;
  }

  async createCart(customerProfileId: string): Promise<any> {
    this.cart = {
      id: `cart-${Date.now()}`,
      customerProfileId,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return this.cart;
  }

  async findCartItem(cartId: string, variantId: string): Promise<any | null> {
    return this.cart.items.find((i: any) => i.cartId === cartId && i.productVariantId === variantId) || null;
  }

  async findCartItemById(cartItemId: string): Promise<any | null> {
    return this.cart.items.find((i: any) => i.id === cartItemId) || null;
  }

  async addCartItem(cartId: string, variantId: string, quantity: number): Promise<any> {
    const existing = await this.findCartItem(cartId, variantId);
    if (existing) {
      existing.quantity += quantity;
      return existing;
    }
    const newItem = {
      id: `item-${Date.now()}`,
      cartId,
      productVariantId: variantId,
      quantity,
      createdAt: new Date(),
      updatedAt: new Date(),
      variant: {
        id: variantId,
        sku: 'SKU-TEST',
        price: 99.99,
        status: 'ACTIVE',
        product: {
          id: 'prod-1',
          name: 'Test Product',
          slug: 'test-product',
          status: 'ACTIVE',
          brand: 'TestBrand',
          images: [{ url: 'http://example.com/img.jpg', isPrimary: true }],
          vendor: { id: 'v-1', businessName: 'Test Vendor', status: 'ACTIVE' },
        },
        attributes: [{ name: 'Size', value: 'M' }],
        inventory: { availableQuantity: 10, reservedQuantity: 0 },
      },
    };
    this.cart.items.push(newItem);
    return newItem;
  }

  async updateCartItemQuantity(cartItemId: string, quantity: number): Promise<any> {
    const item = await this.findCartItemById(cartItemId);
    if (item) item.quantity = quantity;
    return item;
  }

  async deleteCartItem(cartItemId: string): Promise<void> {
    this.cart.items = this.cart.items.filter((i: any) => i.id !== cartItemId);
  }

  async clearCart(cartId: string): Promise<void> {
    if (this.cart.id === cartId) this.cart.items = [];
  }
}

class MockCustomerRepository implements ICustomerRepository {
  async findProfileByUserId(userId: string): Promise<any | null> {
    return { id: 'profile-1', userId };
  }
  async upsertProfile(userId: string, data: any): Promise<any> {
    return { id: 'profile-1', userId, ...data };
  }
  async findAddressById(): Promise<any | null> { return null; }
  async findAddressesByUserId(userId: string): Promise<any[]> { return []; }
  async createAddress(): Promise<any> { return {}; }
  async updateAddress(): Promise<any> { return {}; }
  async deleteAddress(): Promise<void> {}
  async setDefaultAddress(): Promise<any> { return {}; }
}

describe('CartService — Operation & Validation Tests', () => {
  let cartService: CartService;
  let cartRepo: MockCartRepository;
  let customerRepo: MockCustomerRepository;

  beforeEach(() => {
    cartRepo = new MockCartRepository();
    customerRepo = new MockCustomerRepository();
    cartService = new CartService(cartRepo, customerRepo);
  });

  it('should add item to cart and calculate correct item total and subtotal', async () => {
    const cart = await cartService.addItem('user-1', {
      productVariantId: 'var-1',
      quantity: 2,
    });

    expect(cart.items).toHaveLength(1);
    expect(cart.totalItemCount).toBe(2);
    expect(cart.subtotal).toBe(199.98); // 99.99 * 2
    expect(cart.isValidForCheckout).toBe(true);
  });

  it('should update item quantity in cart', async () => {
    const added = await cartService.addItem('user-1', { productVariantId: 'var-1', quantity: 1 });
    const itemId = added.items[0].id;

    const updated = await cartService.updateItemQuantity('user-1', itemId, { quantity: 5 });
    expect(updated.totalItemCount).toBe(5);
    expect(updated.subtotal).toBe(499.95);
  });

  it('should remove item when quantity is set to 0', async () => {
    const added = await cartService.addItem('user-1', { productVariantId: 'var-1', quantity: 2 });
    const itemId = added.items[0].id;

    const updated = await cartService.updateItemQuantity('user-1', itemId, { quantity: 0 });
    expect(updated.items).toHaveLength(0);
    expect(updated.totalItemCount).toBe(0);
  });

  it('should remove item from cart explicitly', async () => {
    const added = await cartService.addItem('user-1', { productVariantId: 'var-1', quantity: 2 });
    const itemId = added.items[0].id;

    const updated = await cartService.removeItem('user-1', itemId);
    expect(updated.items).toHaveLength(0);
  });

  it('should throw NotFoundError when removing non-existent cart item', async () => {
    await expect(cartService.removeItem('user-1', 'non-existent-item')).rejects.toThrow(NotFoundError);
  });

  it('should flag cart as invalid for checkout when item stock is insufficient', async () => {
    await cartService.addItem('user-1', { productVariantId: 'var-1', quantity: 1 });
    // Simulate inventory drop
    cartRepo.cart.items[0].variant.inventory.availableQuantity = 0;

    const cart = await cartService.getCart('user-1');
    expect(cart.isValidForCheckout).toBe(false);
    expect(cart.items[0].isAvailable).toBe(false);
    expect(cart.items[0].validationError).toContain('Insufficient stock');
  });

  it('should flag cart as invalid for checkout when product status becomes inactive', async () => {
    await cartService.addItem('user-1', { productVariantId: 'var-1', quantity: 1 });
    // Inactivate product
    cartRepo.cart.items[0].variant.product.status = 'DRAFT';

    const cart = await cartService.getCart('user-1');
    expect(cart.isValidForCheckout).toBe(false);
    expect(cart.items[0].isAvailable).toBe(false);
  });
});
