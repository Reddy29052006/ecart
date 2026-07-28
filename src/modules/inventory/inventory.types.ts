export type VariantStatusType = 'ACTIVE' | 'INACTIVE';
export type MovementTypeValue = 'STOCK_IN' | 'STOCK_OUT' | 'RESERVED' | 'RELEASED' | 'ADJUSTMENT';

export interface VariantAttributeEntity {
  id: string;
  variantId: string;
  name: string;
  value: string;
}

export interface InventoryEntity {
  id: string;
  variantId: string;
  availableQuantity: number;
  reservedQuantity: number;
  updatedAt: Date;
}

export interface InventoryMovementEntity {
  id: string;
  variantId: string;
  type: MovementTypeValue;
  quantity: number;
  referenceType: string | null;
  referenceId: string | null;
  note: string | null;
  createdAt: Date;
}

export interface ProductVariantEntity {
  id: string;
  productId: string;
  sku: string;
  price: number;
  status: VariantStatusType;
  lowStockThreshold: number;
  createdAt: Date;
  updatedAt: Date;
  attributes?: VariantAttributeEntity[];
  inventory?: InventoryEntity | null;
}
