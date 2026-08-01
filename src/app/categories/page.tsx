'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageContainer, PageTitle } from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { CategoryGrid } from '@/components/storefront/category-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchCategories } from '@/lib/api/categories-api';
import type { CategoryEntity } from '@/modules/catalog/category.types';

const defaultCategoryGradients: Record<string, string> = {
  ceramics: 'linear-gradient(135deg, #F8F1E5 0%, #EBC1B4 100%)',
  textiles: 'linear-gradient(135deg, #EBF3E8 0%, #C4D7B2 100%)',
  apothecary: 'linear-gradient(135deg, #F3EAE8 0%, #D8B4F8 100%)',
  woodwork: 'linear-gradient(135deg, #FDF7E4 0%, #D2B48C 100%)',
  paper: 'linear-gradient(135deg, #E6F4F1 0%, #B2EBF2 100%)',
  jewelry: 'linear-gradient(135deg, #FFF5E4 0%, #FFE0B2 100%)',
};

const defaultCategoryIcons: Record<string, string> = {
  ceramics: '🏺',
  textiles: '🧶',
  apothecary: '🌿',
  woodwork: '🪵',
  paper: '📜',
  jewelry: '✨',
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then((cats) => setCategories(cats))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const formattedCategories = categories.map((cat) => ({
    slug: cat.slug,
    name: cat.name,
    icon: defaultCategoryIcons[cat.slug] || '🪴',
    description: cat.description || 'Artisan collection',
    bg: defaultCategoryGradients[cat.slug] || 'linear-gradient(135deg, var(--color-pistachio-light) 0%, var(--color-bg-secondary) 100%)',
  }));

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Categories' }]} />
      <PageTitle
        title="Curated Collections"
        description="Explore handcrafted goods organized by artisan discipline and organic materials."
      />

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} width="100%" height="200px" borderRadius="var(--radius-md)" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>No categories currently available.</p>
          <Link href="/products" style={{ color: 'var(--color-pistachio-dark)', fontWeight: 600 }}>
            Browse All Products →
          </Link>
        </div>
      ) : (
        <CategoryGrid categories={formattedCategories} />
      )}
    </PageContainer>
  );
}
