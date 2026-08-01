'use client';

import React from 'react';
import { AccountNav } from '@/components/account/account-nav';

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <div
      className="container"
      style={{
        paddingTop: '48px',
        paddingBottom: '80px',
        display: 'grid',
        gridTemplateColumns: '240px 1fr',
        gap: '32px',
        alignItems: 'flex-start',
      }}
    >
      {/* Sidebar Nav */}
      <aside style={{ position: 'sticky', top: '24px' }}>
        <AccountNav />
      </aside>

      {/* Page Content */}
      <main style={{ minWidth: 0 }}>{children}</main>

      <style jsx global>{`
        @media (max-width: 768px) {
          .container > aside,
          .container > main {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </div>
  );
}
