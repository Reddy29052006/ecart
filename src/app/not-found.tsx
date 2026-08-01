import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/page-container';

export default function NotFound() {
  return (
    <PageContainer vPad="xl">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: '50vh',
          gap: '16px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display, serif)',
            fontSize: '96px',
            fontWeight: 400,
            color: 'var(--color-pistachio-light)',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          404
        </div>
        <h1
          style={{
            fontSize: '2.25rem',
            fontFamily: 'var(--font-display, serif)',
            fontWeight: 400,
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          Page Not Found
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: 'var(--color-text-secondary)',
            maxWidth: '420px',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <Link href="/">
            <Button variant="primary">Back to Home</Button>
          </Link>
          <Link href="/products">
            <Button variant="outline">Browse Products</Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
