'use client';

import React from 'react';
import { ProductCard } from './product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import type { ProductWithDetails } from '@/lib/api/products-api';

interface ProductGridProps {
  products: ProductWithDetails[];
  isLoading?: boolean;
  onClearFilters?: () => void;
}

export function ProductGrid({ products, isLoading = false, onClearFilters }: ProductGridProps) {
  if (isLoading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '24px',
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <Skeleton width="100%" height="180px" borderRadius="var(--radius-sm)" />
            <Skeleton width="40%" height="14px" />
            <Skeleton width="85%" height="20px" />
            <Skeleton width="30%" height="22px" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="No products found"
        description="We couldn't find any products matching your search or active filter criteria."
        action={
          onClearFilters ? (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Clear All Filters
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '24px',
      }}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
