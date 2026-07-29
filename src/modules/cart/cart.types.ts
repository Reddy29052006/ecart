import type { Prisma } from '@prisma/client';

export type CartItemWithVariantPayload = Prisma.CartItemGetPayload<{
  include: {
    variant: {
      include: {
        attributes: true;
        inventory: true;
        product: {
          include: {
            images: true;
            vendor: true;
          };
        };
      };
    };
  };
}>;

export type CartWithItemsPayload = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        variant: {
          include: {
            attributes: true;
            inventory: true;
            product: {
              include: {
                images: true;
                vendor: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export interface CartItemVariantDetail {
  id: string;
  sku: string;
  price: number;
  status: string;
  product: {
    id: string;
    name: string;
    slug: string;
    status: string;
    brand: string | null;
    images: { url: string; isPrimary: boolean }[];
    vendor: {
      id: string;
      businessName: string;
      status: string;
    };
  };
  attributes: { name: string; value: string }[];
  inventory: {
    availableQuantity: number;
    reservedQuantity: number;
    sellableQuantity: number;
  } | null;
}

export interface CartItemDetail {
  id: string;
  cartId: string;
  productVariantId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant: CartItemVariantDetail;
  isAvailable: boolean;
  validationError?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartDetail {
  id: string;
  customerProfileId: string;
  items: CartItemDetail[];
  totalItemCount: number;
  subtotal: number;
  isValidForCheckout: boolean;
  createdAt: Date;
  updatedAt: Date;
}

