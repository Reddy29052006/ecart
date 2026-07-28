import type { VariantStatusType } from './inventory.types';

export interface CreateVariantDto {
  sku: string;
  price: number;
  status?: VariantStatusType;
  lowStockThreshold?: number;
  attributes?: Array<{ name: string; value: string }>;
}

export interface UpdateVariantDto {
  sku?: string;
  price?: number;
  status?: VariantStatusType;
  lowStockThreshold?: number;
}

export interface AddStockDto {
  quantity: number;
  note?: string;
  referenceType?: string;
  referenceId?: string;
}

export interface AdjustStockDto {
  quantity: number; // can be negative for removal
  note?: string;
}
