import type { CartDetail, CartWithItemsPayload, CartItemWithVariantPayload } from './cart.types';
import type { AddToCartDto, UpdateCartItemDto } from './cart.dto';

export interface ICartRepository {
  findCartByCustomerId(customerProfileId: string): Promise<CartWithItemsPayload | null>;
  createCart(customerProfileId: string): Promise<CartWithItemsPayload>;
  findCartItem(cartId: string, variantId: string): Promise<CartItemWithVariantPayload | null>;
  findCartItemById(cartItemId: string): Promise<CartItemWithVariantPayload | null>;
  addCartItem(cartId: string, variantId: string, quantity: number): Promise<CartItemWithVariantPayload>;
  updateCartItemQuantity(cartItemId: string, quantity: number): Promise<CartItemWithVariantPayload>;
  deleteCartItem(cartItemId: string): Promise<void>;
  clearCart(cartId: string): Promise<void>;
}

export interface ICartService {
  getCart(userId: string): Promise<CartDetail>;
  addItem(userId: string, dto: AddToCartDto): Promise<CartDetail>;
  updateItemQuantity(userId: string, cartItemId: string, dto: UpdateCartItemDto): Promise<CartDetail>;
  removeItem(userId: string, cartItemId: string): Promise<CartDetail>;
  clearCart(userId: string): Promise<void>;
}
