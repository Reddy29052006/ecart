import type { ICartRepository, ICartService } from './cart.contracts';
import type { ICustomerRepository } from '@/modules/customer';
import type { AddToCartDto, UpdateCartItemDto } from './cart.dto';
import type { CartDetail, CartItemDetail, CartWithItemsPayload, CartItemWithVariantPayload } from './cart.types';
import { NotFoundError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger/logger';

export class CartService implements ICartService {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly customerRepository: ICustomerRepository
  ) {}

  private async getOrCreateCustomerProfileId(userId: string): Promise<string> {
    let profile = await this.customerRepository.findProfileByUserId(userId);
    if (!profile) {
      profile = await this.customerRepository.upsertProfile(userId, {});
      logger.info(`[Cart] Auto-created customer profile for user`, { userId });
    }
    return profile.id;
  }

  private async getOrCreateCart(customerProfileId: string): Promise<CartWithItemsPayload> {
    let cart = await this.cartRepository.findCartByCustomerId(customerProfileId);
    if (!cart) {
      cart = await this.cartRepository.createCart(customerProfileId);
    }
    return cart;
  }

  private formatCart(rawCart: CartWithItemsPayload): CartDetail {
    let subtotal = 0;
    let totalItemCount = 0;
    let isValidForCheckout = true;

    const items: CartItemDetail[] = (rawCart.items || []).map((item: CartItemWithVariantPayload) => {
      const variant = item.variant;
      const product = variant?.product;
      const inventory = variant?.inventory;

      const availableQty = inventory?.availableQuantity ?? 0;
      const reservedQty = inventory?.reservedQuantity ?? 0;
      const sellableQty = Math.max(0, availableQty - reservedQty);

      let isAvailable = true;
      let validationError: string | undefined;

      if (!variant || variant.status !== 'ACTIVE') {
        isAvailable = false;
        validationError = 'Variant is inactive or no longer available';
      } else if (!product || product.status !== 'ACTIVE') {
        isAvailable = false;
        validationError = 'Product is inactive or unpublished';
      } else if (sellableQty < item.quantity) {
        isAvailable = false;
        validationError = `Insufficient stock (Requested: ${item.quantity}, Available: ${sellableQty})`;
      }

      if (!isAvailable) {
        isValidForCheckout = false;
      }

      const unitPrice = variant?.price ?? 0;
      const totalPrice = unitPrice * item.quantity;

      subtotal += totalPrice;
      totalItemCount += item.quantity;

      return {
        id: item.id,
        cartId: item.cartId,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        isAvailable,
        validationError,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        variant: {
          id: variant.id,
          sku: variant.sku,
          price: variant.price,
          status: variant.status,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            status: product.status,
            brand: product.brand,
            images: (product.images || []).map((img) => ({
              url: img.url,
              isPrimary: img.isPrimary,
            })),
            vendor: {
              id: product.vendor?.id,
              businessName: product.vendor?.businessName,
              status: product.vendor?.status,
            },
          },
          attributes: (variant.attributes || []).map((attr) => ({
            name: attr.name,
            value: attr.value,
          })),
          inventory: inventory
            ? {
                availableQuantity: availableQty,
                reservedQuantity: reservedQty,
                sellableQuantity: sellableQty,
              }
            : null,
        },
      };
    });

    if (items.length === 0) {
      isValidForCheckout = false;
    }

    return {
      id: rawCart.id,
      customerProfileId: rawCart.customerProfileId,
      items,
      totalItemCount,
      subtotal,
      isValidForCheckout,
      createdAt: rawCart.createdAt,
      updatedAt: rawCart.updatedAt,
    };
  }

  async getCart(userId: string): Promise<CartDetail> {
    const profileId = await this.getOrCreateCustomerProfileId(userId);
    const rawCart = await this.getOrCreateCart(profileId);
    return this.formatCart(rawCart);
  }

  async addItem(userId: string, dto: AddToCartDto): Promise<CartDetail> {
    const profileId = await this.getOrCreateCustomerProfileId(userId);
    const cart = await this.getOrCreateCart(profileId);
    const requestedQty = dto.quantity ?? 1;

    await this.cartRepository.addCartItem(cart.id, dto.productVariantId, requestedQty);
    logger.info('[Cart] Item added to cart', { userId, variantId: dto.productVariantId, quantity: requestedQty });

    const updatedCart = await this.getOrCreateCart(profileId);
    return this.formatCart(updatedCart);
  }

  async updateItemQuantity(userId: string, cartItemId: string, dto: UpdateCartItemDto): Promise<CartDetail> {
    const profileId = await this.getOrCreateCustomerProfileId(userId);
    const cart = await this.getOrCreateCart(profileId);
    const item = await this.cartRepository.findCartItemById(cartItemId);

    if (!item || item.cartId !== cart.id) {
      throw new NotFoundError('Cart item not found');
    }

    if (dto.quantity === 0) {
      await this.cartRepository.deleteCartItem(cartItemId);
    } else {
      await this.cartRepository.updateCartItemQuantity(cartItemId, dto.quantity);
    }

    logger.info('[Cart] Cart item quantity updated', { userId, cartItemId, quantity: dto.quantity });

    const updatedCart = await this.getOrCreateCart(profileId);
    return this.formatCart(updatedCart);
  }

  async removeItem(userId: string, cartItemId: string): Promise<CartDetail> {
    const profileId = await this.getOrCreateCustomerProfileId(userId);
    const cart = await this.getOrCreateCart(profileId);
    const item = await this.cartRepository.findCartItemById(cartItemId);

    if (!item || item.cartId !== cart.id) {
      throw new NotFoundError('Cart item not found');
    }

    await this.cartRepository.deleteCartItem(cartItemId);
    logger.info('[Cart] Cart item removed', { userId, cartItemId });

    const updatedCart = await this.getOrCreateCart(profileId);
    return this.formatCart(updatedCart);
  }

  async clearCart(userId: string): Promise<void> {
    const profileId = await this.getOrCreateCustomerProfileId(userId);
    const cart = await this.cartRepository.findCartByCustomerId(profileId);

    if (cart) {
      await this.cartRepository.clearCart(cart.id);
      logger.info('[Cart] Cart cleared', { userId, cartId: cart.id });
    }
  }
}
