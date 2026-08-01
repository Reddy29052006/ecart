'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { VendorNav } from '@/components/vendor/vendor-nav';
import { Badge } from '@/components/ui/badge';
import { getSession } from '@/lib/auth/client-session';
import { fetchVendorProfile } from '@/lib/api/vendor-api';
import type { VendorProfileEntity } from '@/modules/vendor/vendor.types';

interface VendorLayoutProps {
  children: React.ReactNode;
}

export default function VendorLayout({ children }: VendorLayoutProps) {
  const router = useRouter();
  const session = getSession();

  const [profile, setProfile] = useState<VendorProfileEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!session) {
      router.replace('/login');
      return;
    }
    if (session.role !== 'VENDOR') {
      router.replace('/account');
      return;
    }

    try {
      const data = await fetchVendorProfile();
      setProfile(data);
    } catch {
      // Profile might not exist yet or request failed
    } finally {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <div
      className="container"
      style={{
        paddingTop: '48px',
        paddingBottom: '80px',
      }}
    >
      {/* Authoritative Status Banner */}
      {!isLoading && profile && profile.status !== 'ACTIVE' && (
        <div
          style={{
            marginBottom: '32px',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor:
              profile.status === 'PENDING'
                ? 'var(--color-bg-secondary)'
                : 'var(--color-terracotta-light)',
            border:
              profile.status === 'PENDING'
                ? '1px solid var(--color-border)'
                : '1px solid rgba(198,93,69,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>
              {profile.status === 'PENDING' ? '⏳' : '🚫'}
            </span>
            <div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}
              >
                {profile.status === 'PENDING'
                  ? 'Vendor Account Pending Approval'
                  : 'Vendor Account Suspended'}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  marginTop: '2px',
                }}
              >
                {profile.status === 'PENDING'
                  ? 'Your store profile is under review by marketplace administrators. Public store listing is currently hidden.'
                  : 'Your vendor privileges have been suspended. Please contact administrator support.'}
              </div>
            </div>
          </div>

          <Badge
            variant={profile.status === 'PENDING' ? 'warning' : 'berry'}
            size="md"
          >
            STATUS: {profile.status}
          </Badge>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '240px 1fr',
          gap: '32px',
          alignItems: 'flex-start',
        }}
      >
        {/* Sidebar Nav */}
        <aside style={{ position: 'sticky', top: '24px' }}>
          <VendorNav />
        </aside>

        {/* Main Content */}
        <main style={{ minWidth: 0 }}>{children}</main>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .container > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
