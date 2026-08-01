'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils/formatting';
import { fetchProductBySlugOrId, type ProductWithDetails } from '@/lib/api/products-api';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [addedNotice, setAddedNotice] = useState<boolean>(false);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);

    fetchProductBySlugOrId(slug)
      .then((data) => {
        setProduct(data);
        const primary = data.images?.find((i) => i.isPrimary)?.url || data.images?.[0]?.url || null;
        setSelectedImage(primary);
      })
      .catch((err) => {
        setError(err.message || 'Product not found');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug]);

  if (isLoading) {
    return (
      <PageContainer>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginTop: '24px' }}>
          <Skeleton width="100%" height="450px" borderRadius="var(--radius-md)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Skeleton width="30%" height="24px" />
            <Skeleton width="80%" height="36px" />
            <Skeleton width="40%" height="28px" />
            <Skeleton width="100%" height="120px" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !product) {
    return (
      <PageContainer>
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Products', href: '/products' }, { label: 'Not Found' }]} />
        <div
          style={{
            textAlign: 'center',
            padding: '64px 24px',
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            margin: '32px 0',
          }}
        >
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🔍</span>
          <h2 style={{ fontFamily: 'var(--font-display, serif)', fontSize: '28px', margin: '0 0 12px' }}>
            Product Not Found
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
            {error || "The product you're looking for does not exist or has been removed."}
          </p>
          <Button variant="primary" onClick={() => router.push('/products')}>
            Back to Catalog
          </Button>
        </div>
      </PageContainer>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const maxStock = Math.min(product.stock, 99);

  const handleAddToCart = () => {
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
          ...(product.category ? [{ label: product.category.name, href: `/categories/${product.category.slug}` }] : []),
          { label: product.name },
        ]}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '48px',
          margin: '24px 0 64px',
          alignItems: 'flex-start',
        }}
        className="product-detail-grid"
      >
        {/* Left Column — Image Gallery */}
        <div>
          {/* Main Image Display */}
          <div
            style={{
              width: '100%',
              aspectRatio: '1/1',
              backgroundColor: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'var(--color-text-muted)',
                }}
              >
                <span style={{ fontSize: '64px' }}>🌿</span>
                <span>Artisan Product Image</span>
              </div>
            )}
          </div>

          {/* Thumbnails list */}
          {product.images && product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    border:
                      selectedImage === img.url
                        ? '2px solid var(--color-pistachio-dark)'
                        : '1px solid var(--color-border)',
                    cursor: 'pointer',
                    padding: 0,
                    backgroundColor: 'var(--color-bg-secondary)',
                  }}
                >
                  <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column — Product Details & Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Category & Status */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {product.category && (
              <Badge variant="pistachio" size="md">
                {product.category.name}
              </Badge>
            )}
            {isOutOfStock ? (
              <Badge variant="error" size="md">
                Out of Stock
              </Badge>
            ) : product.stock <= 5 ? (
              <Badge variant="warning" size="md">
                Low Stock ({product.stock} left)
              </Badge>
            ) : (
              <Badge variant="success" size="md">
                In Stock
              </Badge>
            )}
          </div>

          {/* Title & Brand */}
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-display, serif)',
                fontSize: '2.5rem',
                fontWeight: 400,
                color: 'var(--color-text-primary)',
                margin: '0 0 8px',
                lineHeight: 1.15,
              }}
            >
              {product.name}
            </h1>
            {product.brand && (
              <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', margin: 0 }}>
                Brand / Line: <strong>{product.brand}</strong>
              </p>
            )}
          </div>

          {/* Price */}
          <div
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: '2rem',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              padding: '12px 0',
              borderTop: '1px solid var(--color-border)',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            {formatCurrency(product.price)}
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                Description
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {product.description}
              </p>
            </div>
          )}

          {/* Vendor Box */}
          {product.vendor && (
            <div
              style={{
                padding: '16px',
                backgroundColor: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-pistachio-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 700,
                  color: 'var(--color-pistachio-dark)',
                  flexShrink: 0,
                }}
              >
                🏪
              </div>
              <div>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>
                  Sold & Crafted By
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {product.vendor.businessName}
                </div>
                {product.vendor.businessDescription && (
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                    {product.vendor.businessDescription}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Purchase Action Box */}
          <div
            style={{
              padding: '24px',
              backgroundColor: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginTop: '8px',
            }}
          >
            {!isOutOfStock && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Quantity:
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: 'var(--color-bg-main)' }}>
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    style={{ width: '36px', height: '36px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 700 }}
                  >
                    -
                  </button>
                  <span style={{ padding: '0 16px', fontSize: '14px', fontWeight: 600 }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                    disabled={quantity >= maxStock}
                    style={{ width: '36px', height: '36px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 700 }}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {addedNotice && (
              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--color-success-bg)',
                  color: 'var(--color-success-text)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '14px',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                ✅ {quantity} x &ldquo;{product.name}&rdquo; added to cart!
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={isOutOfStock}
              onClick={handleAddToCart}
            >
              {isOutOfStock ? 'Currently Out of Stock' : `Add ${quantity} to Cart — ${formatCurrency(product.price * quantity)}`}
            </Button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .product-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </PageContainer>
  );
}
