/**
 * Products API Client.
 * Connects storefront components to /api/v1/products endpoints.
 */

import type { ProductEntity, ProductImageEntity } from '@/modules/catalog/product.types';
import type { PaginatedProductsResult, ProductSortOption } from '@/modules/catalog/catalog.dto';

export interface FetchProductsParams {
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

export type ProductWithDetails = ProductEntity & {
  images?: ProductImageEntity[];
  category?: { id: string; name: string; slug: string };
  vendor?: { id: string; businessName: string; businessDescription?: string | null; logo?: string | null };
  inStock?: boolean;
};

export async function fetchProducts(params: FetchProductsParams = {}): Promise<PaginatedProductsResult> {
  const query = new URLSearchParams();

  if (params.search) query.set('search', params.search);
  if (params.categoryId) query.set('categoryId', params.categoryId);
  if (params.categorySlug) query.set('categorySlug', params.categorySlug);
  if (params.brand) query.set('brand', params.brand);
  if (params.minPrice !== undefined) query.set('minPrice', params.minPrice.toString());
  if (params.maxPrice !== undefined) query.set('maxPrice', params.maxPrice.toString());
  if (params.inStock !== undefined) query.set('inStock', params.inStock ? 'true' : 'false');
  if (params.sortBy) query.set('sortBy', params.sortBy);
  if (params.page) query.set('page', params.page.toString());
  if (params.pageSize) query.set('pageSize', params.pageSize.toString());

  const url = `/api/v1/products?${query.toString()}`;
  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error(`Failed to fetch products (${res.status})`);
  }

  const body = await res.json();
  return body.data as PaginatedProductsResult;
}

export async function fetchProductBySlugOrId(slugOrId: string): Promise<ProductWithDetails> {
  const url = `/api/v1/products/${encodeURIComponent(slugOrId)}`;
  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Product not found');
    }
    throw new Error(`Failed to fetch product details (${res.status})`);
  }

  const body = await res.json();
  return body.data as ProductWithDetails;
}
