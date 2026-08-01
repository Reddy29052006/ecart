'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageContainer, PageTitle } from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { ProductGrid } from '@/components/storefront/product-grid';
import { ProductFilters, type FilterState } from '@/components/storefront/product-filters';
import { Pagination } from '@/components/storefront/pagination';
import { fetchProducts, type ProductWithDetails } from '@/lib/api/products-api';
import { fetchCategories } from '@/lib/api/categories-api';
import type { CategoryEntity } from '@/modules/catalog/category.types';
import type { ProductSortOption } from '@/modules/catalog/catalog.dto';

function ProductCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Categories list
  const [categories, setCategories] = useState<CategoryEntity[]>([]);

  // Products list & metadata
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Status
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize filter state from URL search params
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    categorySlug: searchParams.get('categorySlug') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    inStock: searchParams.get('inStock') === 'true',
    sortBy: (searchParams.get('sortBy') as ProductSortOption) || 'newest',
  });

  const [page, setPage] = useState<number>(
    parseInt(searchParams.get('page') || '1', 10)
  );

  // Load initial categories
  useEffect(() => {
    fetchCategories()
      .then((cats) => setCategories(cats))
      .catch(() => {
        // Fallback silently if categories fail
      });
  }, []);

  // Fetch products whenever filters or page change
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const minPriceNum = filters.minPrice !== '' ? parseFloat(filters.minPrice) : undefined;
      const maxPriceNum = filters.maxPrice !== '' ? parseFloat(filters.maxPrice) : undefined;

      const result = await fetchProducts({
        search: filters.search || undefined,
        categorySlug: filters.categorySlug || undefined,
        brand: filters.brand || undefined,
        minPrice: !isNaN(minPriceNum!) ? minPriceNum : undefined,
        maxPrice: !isNaN(maxPriceNum!) ? maxPriceNum : undefined,
        inStock: filters.inStock || undefined,
        sortBy: filters.sortBy,
        page,
        pageSize: 12,
      });

      setProducts(result.items);
      setTotalPages(result.pagination.totalPages);
      setTotalItems(result.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Sync state to URL
  const updateUrlParams = (updatedFilters: FilterState, updatedPage: number) => {
    const params = new URLSearchParams();
    if (updatedFilters.search) params.set('search', updatedFilters.search);
    if (updatedFilters.categorySlug) params.set('categorySlug', updatedFilters.categorySlug);
    if (updatedFilters.brand) params.set('brand', updatedFilters.brand);
    if (updatedFilters.minPrice) params.set('minPrice', updatedFilters.minPrice);
    if (updatedFilters.maxPrice) params.set('maxPrice', updatedFilters.maxPrice);
    if (updatedFilters.inStock) params.set('inStock', 'true');
    if (updatedFilters.sortBy !== 'newest') params.set('sortBy', updatedFilters.sortBy);
    if (updatedPage > 1) params.set('page', updatedPage.toString());

    const queryString = params.toString();
    router.replace(`/products${queryString ? `?${queryString}` : ''}`, { scroll: false });
  };

  const handleFilterChange = (partial: Partial<FilterState>) => {
    const updated = { ...filters, ...partial };
    setFilters(updated);
    setPage(1); // Reset page to 1 on filter change
    updateUrlParams(updated, 1);
  };

  const handleResetFilters = () => {
    const resetState: FilterState = {
      search: '',
      categorySlug: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      sortBy: 'newest',
    };
    setFilters(resetState);
    setPage(1);
    router.replace('/products');
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrlParams(filters, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
        ]}
      />

      <PageTitle
        title="Artisan Products"
        description={`Discover handcrafted and organic products from independent vendors. (${totalItems} items)`}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '32px',
          alignItems: 'flex-start',
        }}
        className="catalog-layout"
      >
        {/* Filters Sidebar */}
        <aside>
          <ProductFilters
            filters={filters}
            categories={categories}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Catalog Grid */}
        <main style={{ minWidth: 0 }}>
          {error ? (
            <div
              style={{
                backgroundColor: 'var(--color-terracotta-light)',
                border: '1px solid rgba(198,93,69,0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                color: 'var(--color-terracotta-dark)',
              }}
            >
              <h3 style={{ margin: '0 0 8px' }}>Unable to load catalog</h3>
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          ) : (
            <>
              <ProductGrid
                products={products}
                isLoading={isLoading}
                onClearFilters={handleResetFilters}
              />

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </main>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .catalog-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </PageContainer>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <PageTitle title="Artisan Products" description="Loading catalog..." />
        </PageContainer>
      }
    >
      <ProductCatalogContent />
    </Suspense>
  );
}
