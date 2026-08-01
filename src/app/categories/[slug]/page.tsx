'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PageContainer, PageTitle } from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { ProductGrid } from '@/components/storefront/product-grid';
import { fetchProducts, type ProductWithDetails } from '@/lib/api/products-api';

export default function CategoryDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);

    fetchProducts({ categorySlug: slug, pageSize: 24 })
      .then((res) => {
        setProducts(res.items);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load category products');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug]);

  const categoryTitle = slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Categories', href: '/categories' },
          { label: categoryTitle },
        ]}
      />

      <PageTitle
        title={`${categoryTitle} Collection`}
        description={`Discover curated ${slug} handcrafted by independent artisans.`}
      />

      {error ? (
        <div
          style={{
            padding: '24px',
            backgroundColor: 'var(--color-terracotta-light)',
            color: 'var(--color-terracotta-dark)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {error}
        </div>
      ) : (
        <ProductGrid products={products} isLoading={isLoading} />
      )}
    </PageContainer>
  );
}
