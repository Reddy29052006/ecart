'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageTitle } from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { FormField, FormError, FormSuccess } from '@/components/forms/form-field';
import { getSession } from '@/lib/auth/client-session';

interface CategoryEntity {
  id: string;
  name: string;
  slug: string;
}

export default function NewVendorProductPage() {
  const router = useRouter();
  const session = getSession();

  const [categories, setCategories] = useState<CategoryEntity[]>([]);
  const [isLoadingCat, setIsLoadingCat] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    brand: '',
    price: '',
    stock: '',
    description: '',
    imageUrl: '',
  });

  const loadCategories = useCallback(async () => {
    if (!session) {
      router.replace('/login');
      return;
    }
    if (session.role !== 'VENDOR') {
      router.replace('/account');
      return;
    }

    try {
      const res = await fetch('/api/v1/categories');
      if (res.ok) {
        const json = await res.json();
        const cats = json.data || [];
        setCategories(cats);
        if (cats.length > 0) {
          setForm((f) => ({ ...f, categoryId: cats[0].id }));
        }
      }
    } catch {
      setGlobalError('Failed to load category selection.');
    } finally {
      setIsLoadingCat(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleChange = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setFieldErrors((e) => ({ ...e, [field]: '' }));
    setGlobalError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setSuccessMessage(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Product name is required';
    if (!form.categoryId) errors.categoryId = 'Category selection is required';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) {
      errors.price = 'Valid price is required';
    }
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0) {
      errors.stock = 'Valid stock quantity is required';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('ecart_access_token');
      const res = await fetch('/api/v1/vendors/me/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: form.name.trim(),
          categoryId: form.categoryId,
          brand: form.brand.trim() || undefined,
          price: Number(form.price),
          stock: Number(form.stock),
          description: form.description.trim() || undefined,
          imageUrl: form.imageUrl.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        if (json.errors) {
          const mapped: Record<string, string> = {};
          Object.entries(json.errors).forEach(([k, v]: [string, unknown]) => {
            mapped[k] = Array.isArray(v) ? String(v[0]) : String(v);
          });
          setFieldErrors(mapped);
        } else {
          throw new Error(json.message || 'Failed to create product');
        }
      } else {
        setSuccessMessage('Product created successfully! Redirecting to catalog...');
        setTimeout(() => {
          router.push('/vendor/products');
        }, 1200);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create product.';
      setGlobalError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Vendor Portal', href: '/vendor' },
          { label: 'Products & Catalog', href: '/vendor/products' },
          { label: 'New Product' },
        ]}
      />

      <PageTitle
        title="Add New Vendor Product"
        description="List a new item in your storefront catalog under a selected category."
      />

      <Card variant="default" padding="lg">
        <CardContent>
          {isLoadingCat ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Skeleton width="100%" height="42px" />
              <Skeleton width="100%" height="42px" />
              <Skeleton width="100%" height="42px" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {globalError && <FormError message={globalError} style={{ marginBottom: '20px' }} />}
              {successMessage && (
                <FormSuccess message={successMessage} style={{ marginBottom: '20px' }} />
              )}

              <FormField
                label="Product Name"
                htmlFor="name"
                required
                error={fieldErrors.name}
                style={{ marginBottom: '20px' }}
              >
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g. Handcrafted Ceramic Mug"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  aria-invalid={Boolean(fieldErrors.name)}
                />
              </FormField>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                  marginBottom: '20px',
                }}
              >
                <FormField
                  label="Category"
                  htmlFor="categoryId"
                  required
                  error={fieldErrors.categoryId}
                >
                  <select
                    id="categoryId"
                    value={form.categoryId}
                    onChange={(e) => handleChange('categoryId', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      borderRadius: 'var(--radius-md)',
                      border: fieldErrors.categoryId
                        ? '1px solid var(--color-error-text)'
                        : '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg-card)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Brand / Line" htmlFor="brand" error={fieldErrors.brand}>
                  <Input
                    id="brand"
                    type="text"
                    placeholder="e.g. Artisan Studio"
                    value={form.brand}
                    onChange={(e) => handleChange('brand', e.target.value)}
                  />
                </FormField>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                  marginBottom: '20px',
                }}
              >
                <FormField
                  label="Price ($)"
                  htmlFor="price"
                  required
                  error={fieldErrors.price}
                >
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="29.99"
                    value={form.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.price)}
                  />
                </FormField>

                <FormField
                  label="Initial Stock Quantity"
                  htmlFor="stock"
                  required
                  error={fieldErrors.stock}
                >
                  <Input
                    id="stock"
                    type="number"
                    placeholder="50"
                    value={form.stock}
                    onChange={(e) => handleChange('stock', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.stock)}
                  />
                </FormField>
              </div>

              <FormField
                label="Product Image URL"
                htmlFor="imageUrl"
                hint="Direct URL link to high-resolution product image."
                error={fieldErrors.imageUrl}
                style={{ marginBottom: '20px' }}
              >
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://..."
                  value={form.imageUrl}
                  onChange={(e) => handleChange('imageUrl', e.target.value)}
                />
              </FormField>

              <FormField
                label="Product Description"
                htmlFor="description"
                error={fieldErrors.description}
                style={{ marginBottom: '28px' }}
              >
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Provide details about craftsmanship, material, dimensions..."
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg-card)',
                    color: 'var(--color-text-primary)',
                    lineHeight: 1.5,
                  }}
                />
              </FormField>

              <div style={{ display: 'flex', gap: '12px' }}>
                <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                  Create Product
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => router.push('/vendor/products')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </>
  );
}
