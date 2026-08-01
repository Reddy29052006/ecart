'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

interface CategoryCard {
  slug: string;
  name: string;
  icon: string;
  description: string;
  bg: string;
}

interface CategoryGridProps {
  categories: CategoryCard[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '24px',
      }}
    >
      {categories.map((cat) => (
        <Link key={cat.slug} href={`/categories/${cat.slug}`} style={{ textDecoration: 'none' }}>
          <Card
            variant="default"
            padding="md"
            style={{
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              height: '200px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              background: cat.bg,
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <CardContent>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{cat.icon}</div>
              <div
                style={{
                  fontFamily: 'var(--font-display, serif)',
                  fontSize: '20px',
                  color: 'var(--color-text-primary)',
                  fontWeight: 400,
                }}
              >
                {cat.name}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                {cat.description}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
