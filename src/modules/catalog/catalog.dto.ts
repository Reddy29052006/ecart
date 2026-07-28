import type { ProductEntity } from './product.types';

export type ProductSortOption = 'price_asc' | 'price_desc' | 'newest';

export interface ProductQueryDto {
  search?: string;
  categoryId?: string;
  categorySlug?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: ProductSortOption;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export type PaginatedProductsResult = PaginatedResult<ProductEntity>;
