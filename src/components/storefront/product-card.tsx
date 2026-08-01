'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/formatting';
import type { ProductWithDetails } from '@/lib/api/products-api';

interface ProductCardProps {
  product: ProductWithDetails;
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url;
  const isOutOfStock = product.stock <= 0;

  return (
    <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <Card
        variant="default"
        padding="none"
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          e.currentTarget.style.borderColor = 'var(--color-pistachio-dark)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = 'var(--color-border)';
        }}
      >
        {/* Product Image Container */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '4/3',
            backgroundColor: 'var(--color-bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s ease',
              }}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: 'var(--color-text-muted)',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, var(--color-pistachio-light) 0%, var(--color-bg-secondary) 100%)',
              }}
            >
              <span style={{ fontSize: '36px' }}>🌿</span>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>Artisan Product</span>
            </div>
          )}

          {/* Badges overlay */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              alignItems: 'flex-start',
              zIndex: 1,
            }}
          >
            {product.category && (
              <Badge variant="pistachio" size="sm">
                {product.category.name}
              </Badge>
            )}
            {isOutOfStock ? (
              <Badge variant="error" size="sm">
                Out of Stock
              </Badge>
            ) : product.stock <= 5 ? (
              <Badge variant="warning" size="sm">
                Only {product.stock} Left
              </Badge>
            ) : null}
          </div>
        </div>

        {/* Content */}
        <CardContent
          style={{
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            {product.vendor && (
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '4px',
                }}
              >
                {product.vendor.businessName}
              </div>
            )}
            <h3
              style={{
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                margin: 0,
                lineHeight: 1.3,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {product.name}
            </h3>
            {product.brand && (
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px', display: 'block' }}>
                by {product.brand}
              </span>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '8px',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display, serif)',
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}
            >
              {formatCurrency(product.price)}
            </span>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-pistachio-dark)',
              }}
            >
              View details →
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
