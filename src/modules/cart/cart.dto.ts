export interface AddToCartDto {
  productVariantId: string;
  quantity?: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}
