'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageTitle } from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { FormError } from '@/components/forms/form-field';
import { getSession } from '@/lib/auth/client-session';

interface CategoryEntity {
  id: string;
  name: string;
  slug: string;
}

interface ProductEntity {
  id: string;
  vendorId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  price: number;
  stock: number;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  category?: CategoryEntity;
  images?: Array<{ url: string; isPrimary: boolean }>;
}

export default function VendorProductsPage() {
  const router = useRouter();
  const session = getSession();

  const [products, setProducts] = useState<ProductEntity[]>([]);
  const [categories, setCategories] = useState<CategoryEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const loadData = useCallback(async () => {
    if (!session) {
      router.replace('/login');
      return;
    }
    if (session.role !== 'VENDOR') {
      router.replace('/account');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('ecart_access_token');
      const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      // Fetch products & categories in parallel
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/v1/vendors/me/products', { headers: authHeader }),
        fetch('/api/v1/categories'),
      ]);

      if (!prodRes.ok) {
        throw new Error('Failed to load vendor products');
      }
      const prodJson = await prodRes.json();
      setProducts(prodJson.data || []);

      if (catRes.ok) {
        const catJson = await catRes.json();
        setCategories(catJson.data || []);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error loading catalog data.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create Category Lookup Map
  const categoryMap = new Map<string, string>();
  categories.forEach((c) => categoryMap.set(c.id, c.name));

  // Filter products by search term, category, status
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'ALL' || p.categoryId === selectedCategory;

    const matchesStatus =
      selectedStatus === 'ALL' || p.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'DRAFT':
        return 'warning';
      case 'INACTIVE':
        return 'terracotta';
      case 'ARCHIVED':
        return 'olive';
      default:
        return 'olive';
    }
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Vendor Portal', href: '/vendor' },
          { label: 'Products & Catalog' },
        ]}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <PageTitle
          title="Vendor Product Catalog"
          description="Manage your storefront products, categories, stock, and status."
        />

        <Link href="/vendor/products/new" style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="md">
            + Add New Product
          </Button>
        </Link>
      </div>

      {error && <FormError message={error} style={{ marginBottom: '20px' }} />}

      {/* Filter & Search Toolbar */}
      <Card variant="default" padding="md" style={{ marginBottom: '24px' }}>
        <CardContent>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 220px 180px',
              gap: '16px',
              alignItems: 'center',
            }}
          >
            <Input
              type="text"
              placeholder="Search product by name or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="DRAFT">DRAFT</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Product List Table / Grid */}
      <Card variant="default" padding="lg">
        <CardContent>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Skeleton width="100%" height="48px" />
              <Skeleton width="100%" height="48px" />
              <Skeleton width="100%" height="48px" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--color-text-muted)',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📦</div>
              <h4 style={{ margin: '0 0 6px', fontSize: '16px', color: 'var(--color-text-primary)' }}>
                No products found matching filters
              </h4>
              <p style={{ fontSize: '14px', margin: 0 }}>
                Try adjusting your search criteria or add your first vendor product.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '14px',
                  textAlign: 'left',
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: '2px solid var(--color-border)',
                      color: 'var(--color-text-muted)',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    <th style={{ padding: '12px 16px' }}>Product</th>
                    <th style={{ padding: '12px 16px' }}>Category</th>
                    <th style={{ padding: '12px 16px' }}>Brand</th>
                    <th style={{ padding: '12px 16px' }}>Price</th>
                    <th style={{ padding: '12px 16px' }}>Stock</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const categoryName =
                      product.category?.name ||
                      categoryMap.get(product.categoryId) ||
                      'Uncategorized';
                    const primaryImg = product.images?.find((img) => img.isPrimary)?.url;

                    return (
                      <tr
                        key={product.id}
                        style={{
                          borderBottom: '1px solid var(--color-border)',
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'var(--color-bg-secondary)',
                                overflow: 'hidden',
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {primaryImg ? (
                                /* eslint-disable-next-html-element-for-jsx */
                                <img
                                  src={primaryImg}
                                  alt={product.name}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <span style={{ fontSize: '18px' }}>🖼️</span>
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                {product.name}
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                Slug: /{product.slug}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '16px' }}>
                          <Badge variant="olive" size="sm">
                            {categoryName}
                          </Badge>
                        </td>

                        <td style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>
                          {product.brand || '—'}
                        </td>

                        <td style={{ padding: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          ${product.price.toFixed(2)}
                        </td>

                        <td style={{ padding: '16px' }}>
                          <span
                            style={{
                              color:
                                product.stock > 10
                                  ? 'var(--color-success-text)'
                                  : product.stock > 0
                                  ? 'var(--color-warning-text)'
                                  : 'var(--color-error-text)',
                              fontWeight: 600,
                            }}
                          >
                            {product.stock} units
                          </span>
                        </td>

                        <td style={{ padding: '16px' }}>
                          <Badge variant={getStatusBadgeVariant(product.status)} size="sm">
                            {product.status}
                          </Badge>
                        </td>

                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none', marginRight: '10px' }}>
                            <Button variant="outline" size="sm">
                              View Public
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
