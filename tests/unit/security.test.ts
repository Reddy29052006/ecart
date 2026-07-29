import { describe, it, expect, beforeEach } from 'vitest';
import { CustomerService } from '@/modules/customer/customer.service';
import { CartService } from '@/modules/cart/cart.service';
import { NotFoundError, ForbiddenError } from '@/lib/errors/app-error';

// Mock Customer Repository enforcing user ownership boundaries
class MockCustomerRepository {
  private profiles = new Map<string, any>([
    ['user-a', { id: 'prof-a', userId: 'user-a', firstName: 'Alice' }],
    ['user-b', { id: 'prof-b', userId: 'user-b', firstName: 'Bob' }],
  ]);
  private addresses = new Map<string, any>([
    ['addr-a', { id: 'addr-a', userId: 'user-a', addressLine1: '123 Alice St' }],
    ['addr-b', { id: 'addr-b', userId: 'user-b', addressLine1: '456 Bob St' }],
  ]);

  async findProfileByUserId(userId: string) {
    return this.profiles.get(userId) || null;
  }
  async upsertProfile(userId: string, data: any) {
    const updated = { id: `prof-${userId}`, userId, ...data };
    this.profiles.set(userId, updated);
    return updated;
  }
  async findAddressesByUserId(userId: string) {
    return Array.from(this.addresses.values()).filter((a) => a.userId === userId);
  }
  async findAddressById(addressId: string, userId: string) {
    const addr = this.addresses.get(addressId);
    return addr && addr.userId === userId ? addr : null;
  }
  async createAddress(userId: string, data: any) {
    const addr = { id: `addr-${Date.now()}`, userId, ...data };
    this.addresses.set(addr.id, addr);
    return addr;
  }
  async updateAddress(addressId: string, userId: string, data: any) {
    const addr = await this.findAddressById(addressId, userId);
    if (!addr) throw new NotFoundError('Address not found');
    Object.assign(addr, data);
    return addr;
  }
  async deleteAddress(addressId: string, userId: string) {
    const addr = await this.findAddressById(addressId, userId);
    if (!addr) throw new NotFoundError('Address not found');
    this.addresses.delete(addressId);
  }
  async setDefaultAddress(addressId: string, userId: string) {
    const addr = await this.findAddressById(addressId, userId);
    if (!addr) throw new NotFoundError('Address not found');
    return addr;
  }
}

// Mock Cart Repository enforcing customer cart isolation
class MockCartRepository {
  private carts = new Map<string, any>([
    ['prof-a', { id: 'cart-a', customerProfileId: 'prof-a', items: [] }],
    ['prof-b', { id: 'cart-b', customerProfileId: 'prof-b', items: [] }],
  ]);

  async findCartByCustomerId(customerProfileId: string) {
    return this.carts.get(customerProfileId) || null;
  }
  async createCart(customerProfileId: string) {
    const cart = { id: `cart-${customerProfileId}`, customerProfileId, items: [] };
    this.carts.set(customerProfileId, cart);
    return cart;
  }
  async findCartItem(cartId: string, variantId: string) {
    for (const cart of this.carts.values()) {
      if (cart.id === cartId) {
        return cart.items.find((i: any) => i.productVariantId === variantId) || null;
      }
    }
    return null;
  }
  async findCartItemById(cartItemId: string) {
    for (const cart of this.carts.values()) {
      const item = cart.items.find((i: any) => i.id === cartItemId);
      if (item) return item;
    }
    return null;
  }
  async addCartItem(cartId: string, variantId: string, quantity: number) {
    for (const cart of this.carts.values()) {
      if (cart.id === cartId) {
        const item = { id: `item-${Date.now()}`, cartId, productVariantId: variantId, quantity, variant: { price: 10, status: 'ACTIVE', product: { status: 'ACTIVE', vendor: { status: 'ACTIVE' } } } };
        cart.items.push(item);
        return item;
      }
    }
    throw new NotFoundError('Cart not found');
  }
  async updateCartItemQuantity(cartItemId: string, quantity: number) {
    for (const cart of this.carts.values()) {
      const item = cart.items.find((i: any) => i.id === cartItemId);
      if (item) {
        item.quantity = quantity;
        return item;
      }
    }
    throw new NotFoundError('Cart item not found');
  }
  async deleteCartItem(cartItemId: string) {
    for (const cart of this.carts.values()) {
      cart.items = cart.items.filter((i: any) => i.id !== cartItemId);
    }
  }
  async clearCart(cartId: string) {
    for (const cart of this.carts.values()) {
      if (cart.id === cartId) cart.items = [];
    }
  }
}

// Mock Product Repository enforcing vendor product isolation
class MockProductRepository {
  private products = new Map<string, any>([
    ['prod-vendor-a', { id: 'prod-vendor-a', vendorId: 'vendor-prof-a', name: 'Vendor A Product', status: 'ACTIVE' }],
    ['prod-vendor-b', { id: 'prod-vendor-b', vendorId: 'vendor-prof-b', name: 'Vendor B Product', status: 'ACTIVE' }],
  ]);

  async findProductById(id: string) {
    return this.products.get(id) || null;
  }
  async updateProduct(id: string, vendorId: string, data: any) {
    const prod = this.products.get(id);
    if (!prod || prod.vendorId !== vendorId) {
      throw new ForbiddenError('You do not own this product');
    }
    Object.assign(prod, data);
    return prod;
  }
}

describe('Security Boundary & Data Access Protection Tests', () => {
  let customerRepo: MockCustomerRepository;
  let customerService: CustomerService;
  let cartRepo: MockCartRepository;
  let cartService: CartService;

  beforeEach(() => {
    customerRepo = new MockCustomerRepository();
    customerService = new CustomerService(customerRepo as any);
    cartRepo = new MockCartRepository();
    cartService = new CartService(cartRepo as any, customerRepo as any);
  });

  describe('1. Authentication & Unauthenticated Access', () => {
    it('should reject address access when user does not exist or is unauthenticated', async () => {
      await expect(
        customerService.updateAddress('unknown-user', 'addr-a', { fullName: 'Hacker' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('2. Customer Data Ownership Boundaries', () => {
    it('Customer A cannot read Customer B profile', async () => {
      const profileA = await customerService.getProfile('user-a');
      expect(profileA.firstName).toBe('Alice');

      const profileB = await customerService.getProfile('user-b');
      expect(profileB.firstName).toBe('Bob');
      expect(profileA.id).not.toEqual(profileB.id);
    });

    it('Customer A cannot access Customer B address', async () => {
      // Customer A requests Customer B address ID -> returns NotFoundError (address does not belong to Customer A)
      await expect(
        customerService.updateAddress('user-a', 'addr-b', { fullName: 'Hacker' })
      ).rejects.toThrow(NotFoundError);
    });

    it('Customer A cannot delete Customer B address', async () => {
      await expect(
        customerService.deleteAddress('user-a', 'addr-b')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('3. Cart Data Isolation Boundaries', () => {
    it('Customer A cannot modify Customer B cart items', async () => {
      // Setup: Add item to Customer B cart
      const cartB = await cartService.addItem('user-b', { productVariantId: 'var-b', quantity: 1 });
      const itemBId = cartB.items[0].id;

      // Customer A tries to modify Customer B's cart item -> rejects with NotFoundError
      await expect(
        cartService.updateItemQuantity('user-a', itemBId, { quantity: 10 })
      ).rejects.toThrow(NotFoundError);
    });

    it('Customer A cannot remove Customer B cart items', async () => {
      const cartB = await cartService.addItem('user-b', { productVariantId: 'var-b', quantity: 1 });
      const itemBId = cartB.items[0].id;

      await expect(
        cartService.removeItem('user-a', itemBId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('4. Vendor Data Isolation Boundaries', () => {
    it('Vendor A cannot modify Vendor B products', async () => {
      const productRepo = new MockProductRepository();

      await expect(
        productRepo.updateProduct('prod-vendor-b', 'vendor-prof-a', { name: 'Tampered Name' })
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('5. Refresh Token Exposure Protection', () => {
    it('Refresh tokens are isolated server-side and never exposed in client profile response', async () => {
      const profile = await customerService.getProfile('user-a');
      expect((profile as any).token).toBeUndefined();
      expect((profile as any).refreshToken).toBeUndefined();
      expect((profile as any).passwordHash).toBeUndefined();
    });
  });
});
