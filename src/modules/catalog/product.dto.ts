import type { ProductStatusType } from './product.types';

export interface CreateProductDto {
  categoryId: string;
  name: string;
  description?: string;
  brand?: string;
  price: number;
  stock?: number;
}

export interface UpdateProductDto {
  categoryId?: string;
  name?: string;
  description?: string;
  brand?: string;
  price?: number;
  stock?: number;
}

export interface AddProductImageDto {
  url: string;
  sortOrder?: number;
  isPrimary?: boolean;
}
