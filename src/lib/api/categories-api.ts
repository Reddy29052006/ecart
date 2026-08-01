/**
 * Categories API Client.
 * Connects frontend components to /api/v1/categories endpoints.
 */

import type { CategoryEntity } from '@/modules/catalog/category.types';

export async function fetchCategories(): Promise<CategoryEntity[]> {
  const res = await fetch('/api/v1/categories', {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch categories (${res.status})`);
  }

  const body = await res.json();
  return body.data as CategoryEntity[];
}
