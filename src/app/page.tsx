'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CategoryGrid } from '@/components/storefront/category-grid';
import { ProductGrid } from '@/components/storefront/product-grid';
import { fetchCategories } from '@/lib/api/categories-api';
import { fetchProducts, type ProductWithDetails } from '@/lib/api/products-api';
import type { CategoryEntity } from '@/modules/catalog/category.types';

const defaultCategoryGradients: Record<string, string> = {
  ceramics: 'linear-gradient(135deg, #F8F1E5 0%, #EBC1B4 100%)',
  textiles: 'linear-gradient(135deg, #F8F1E5 0%, #DDE9C9 100%)',
  botanicals: 'linear-gradient(135deg, #F8F1E5 0%, #DDE9C9 100%)',
  'home-living': 'linear-gradient(135deg, #F8F1E5 0%, #DDBBC8 100%)',
};

const defaultCategoryIcons: Record<string, string> = {
  ceramics: '🏺',
  textiles: '🧶',
  botanicals: '🌿',
  'home-living': '🪴',
};

export default function HomePage() {
  const [categories, setCategories] = useState<CategoryEntity[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductWithDetails[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then((cats) => setCategories(cats))
      .catch(() => {});

    fetchProducts({ pageSize: 4, sortBy: 'newest' })
      .then((res) => setFeaturedProducts(res.items))
      .catch(() => {})
      .finally(() => setIsLoadingProducts(false));
  }, []);

  const formattedCategoryCards = categories.map((cat) => ({
    slug: cat.slug,
    name: cat.name,
    icon: defaultCategoryIcons[cat.slug] || '✨',
    description: cat.description || 'Artisan collection',
    bg: defaultCategoryGradients[cat.slug] || 'linear-gradient(135deg, var(--color-pistachio-light) 0%, var(--color-bg-secondary) 100%)',
  }));

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderBottom: '1px solid var(--color-border)',
          minHeight: '560px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          className="container"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '48px',
            alignItems: 'center',
            paddingTop: '64px',
            paddingBottom: '64px',
          }}
        >
          {/* Left — Copy */}
          <div className="animate-fade-in">
            <Badge variant="pistachio" style={{ marginBottom: '20px' }}>
              New Season Arrivals
            </Badge>
            <h1
              style={{
                fontFamily: 'var(--font-display, serif)',
                fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                fontWeight: 400,
                color: 'var(--color-text-primary)',
                lineHeight: 1.02,
                letterSpacing: '-0.02em',
                margin: '0 0 20px',
              }}
            >
              Objects made
              <br />
              for everyday
              <br />
              living.
            </h1>
            <p
              style={{
                fontSize: '18px',
                color: 'var(--color-text-secondary)',
                maxWidth: '380px',
                lineHeight: 1.6,
                marginBottom: '32px',
              }}
            >
              Handcrafted ceramics, natural textiles, and sustainably sourced goods from
              independent artisan vendors.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/products">
                <Button variant="secondary" size="lg">
                  Shop Collection
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg">
                  Become a Vendor
                </Button>
              </Link>
            </div>
          </div>

          {/* Right — Decorative blob */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div
              style={{
                width: '420px',
                height: '420px',
                maxWidth: '100%',
                borderRadius: '55% 45% 62% 38% / 50% 50% 52% 48%',
                backgroundColor: 'var(--color-pistachio-light)',
                border: '1px solid var(--color-pistachio-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '80px',
                flexShrink: 0,
              }}
            >
              🌿
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section
        style={{
          backgroundColor: 'var(--color-bg-main)',
          borderBottom: '1px solid var(--color-border)',
          padding: '20px 0',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '32px',
            flexWrap: 'wrap',
          }}
        >
          {[
            'Free shipping on orders $75+',
            'Artisan-verified vendors',
            '30-day returns',
            'Sustainably sourced',
          ].map((text) => (
            <span
              key={text}
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span style={{ color: 'var(--color-pistachio-dark)', fontSize: '16px' }}>✓</span>
              {text}
            </span>
          ))}
        </div>
      </section>

      {/* Category Teaser */}
      {formattedCategoryCards.length > 0 && (
        <section style={{ padding: '80px 0 40px' }}>
          <div className="container">
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <h2
                  style={{
                    fontFamily: 'var(--font-display, serif)',
                    fontSize: '2.25rem',
                    fontWeight: 400,
                    color: 'var(--color-text-primary)',
                    margin: 0,
                  }}
                >
                  Shop by Collection
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                  Curated categories for every living space and lifestyle.
                </p>
              </div>
              <Link href="/categories" style={{ color: 'var(--color-pistachio-dark)', fontWeight: 600, textDecoration: 'none' }}>
                View All Categories →
              </Link>
            </div>
            <CategoryGrid categories={formattedCategoryCards} />
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section style={{ padding: '40px 0 80px' }}>
        <div className="container">
          <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-display, serif)',
                  fontSize: '2.25rem',
                  fontWeight: 400,
                  color: 'var(--color-text-primary)',
                  margin: 0,
                }}
              >
                Featured New Arrivals
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                Handpicked sustainable products straight from independent artisan workshops.
              </p>
            </div>
            <Link href="/products" style={{ color: 'var(--color-pistachio-dark)', fontWeight: 600, textDecoration: 'none' }}>
              Browse Catalog →
            </Link>
          </div>

          <ProductGrid products={featuredProducts} isLoading={isLoadingProducts} />
        </div>
      </section>

      {/* Vendor CTA Banner */}
      <section
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
          padding: '64px 0',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-display, serif)',
                fontSize: '2rem',
                fontWeight: 400,
                color: 'var(--color-text-primary)',
                margin: '0 0 8px',
              }}
            >
              Are you a maker or artisan?
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
              Join our curated marketplace and sell your handcrafted goods to a global audience.
            </p>
          </div>
          <Link href="/register?role=vendor">
            <Button variant="primary" size="lg">
              Apply as a Vendor
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
