import React from 'react';
import { SkeletonCard } from '@/components/ui/skeleton';

export default function GlobalLoading() {
  return (
    <div
      className="container"
      style={{
        paddingTop: '64px',
        paddingBottom: '64px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px',
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
