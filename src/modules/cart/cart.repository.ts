import type { PrismaClient } from '@prisma/client';
import type { ICartRepository } from './cart.contracts';
import type { CartWithItemsPayload, CartItemWithVariantPayload } from './cart.types';

export class CartRepository implements ICartRepository {
  constructor(private readonly db: PrismaClient) {}

  private readonly cartInclude = {
    items: {
      include: {
        variant: {
          include: {
            attributes: true,
            inventory: true,
            product: {
              include: {
                images: {
                  orderBy: { sortOrder: 'asc' as const },
                },
                vendor: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' as const },
    },
  };

  private readonly cartItemInclude = {
    variant: {
      include: {
        attributes: true,
        inventory: true,
        product: {
          include: {
            images: {
              orderBy: { sortOrder: 'asc' as const },
            },
            vendor: true,
          },
        },
      },
    },
  };

  async findCartByCustomerId(customerProfileId: string): Promise<CartWithItemsPayload | null> {
    return this.db.cart.findUnique({
      where: { customerProfileId },
      include: this.cartInclude,
    });
  }

  async createCart(customerProfileId: string): Promise<CartWithItemsPayload> {
    return this.db.cart.create({
      data: { customerProfileId },
      include: this.cartInclude,
    });
  }

  async findCartItem(cartId: string, variantId: string): Promise<CartItemWithVariantPayload | null> {
    return this.db.cartItem.findUnique({
      where: {
        cartId_productVariantId: {
          cartId,
          productVariantId: variantId,
        },
      },
      include: this.cartItemInclude,
    });
  }

  async findCartItemById(cartItemId: string): Promise<CartItemWithVariantPayload | null> {
    return this.db.cartItem.findUnique({
      where: { id: cartItemId },
      include: this.cartItemInclude,
    });
  }

  async addCartItem(cartId: string, variantId: string, quantity: number): Promise<CartItemWithVariantPayload> {
    return this.db.cartItem.upsert({
      where: {
        cartId_productVariantId: {
          cartId,
          productVariantId: variantId,
        },
      },
      create: {
        cartId,
        productVariantId: variantId,
        quantity,
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      include: this.cartItemInclude,
    });
  }

  async updateCartItemQuantity(cartItemId: string, quantity: number): Promise<CartItemWithVariantPayload> {
    return this.db.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: this.cartItemInclude,
    });
  }

  async deleteCartItem(cartItemId: string): Promise<void> {
    await this.db.cartItem.delete({
      where: { id: cartItemId },
    });
  }

  async clearCart(cartId: string): Promise<void> {
    await this.db.cartItem.deleteMany({
      where: { cartId },
    });
  }
}
