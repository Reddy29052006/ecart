'use client';

import React from 'react';
import { ErrorState } from '@/components/ui/error-state';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/page-container';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  return (
    <PageContainer vPad="xl">
      <ErrorState
        title="Something went wrong"
        message={
          error.message ||
          'An unexpected error occurred. Please try refreshing the page or contact support.'
        }
        onRetry={reset}
      />
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <Button variant="ghost" size="sm" onClick={() => (window.location.href = '/')}>
          Return to Home
        </Button>
      </div>
    </PageContainer>
  );
}
