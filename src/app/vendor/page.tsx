'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageTitle } from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getSession, clearSession } from '@/lib/auth/client-session';
import { fetchVendorProfile } from '@/lib/api/vendor-api';
import { getInitials } from '@/lib/utils/formatting';
import type { VendorProfileEntity } from '@/modules/vendor/vendor.types';

export default function VendorOverviewPage() {
  const router = useRouter();
  const session = getSession();
  const [profile, setProfile] = useState<VendorProfileEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.replace('/login');
      return;
    }
    if (session.role !== 'VENDOR') {
      router.replace('/account');
      return;
    }

    fetchVendorProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setIsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = () => {
    clearSession();
    router.replace('/');
  };

  const businessName = profile?.businessName || 'Artisan Vendor';
  const initials = getInitials(businessName);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'SUSPENDED':
        return 'berry';
      default:
        return 'olive';
    }
  };

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Vendor Portal' }]} />

      <PageTitle
        title="Vendor Dashboard"
        description="Manage your maker profile, store details, and catalog."
      >
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Sign Out
        </Button>
      </PageTitle>

      {/* Vendor Identity Card */}
      <Card variant="default" padding="lg" style={{ marginBottom: '24px' }}>
        <CardContent>
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <Skeleton width="72px" height="72px" borderRadius="var(--radius-md)" />
              <div style={{ flex: 1 }}>
                <Skeleton width="40%" height="24px" style={{ marginBottom: '8px' }} />
                <Skeleton width="60%" height="16px" />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {/* Logo / Initials */}
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-terracotta-light)',
                  border: '2px solid var(--color-terracotta-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display, serif)',
                  fontSize: '24px',
                  fontWeight: 600,
                  color: 'var(--color-terracotta-dark)',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}
              >
                {profile?.logo ? (
                  <img
                    src={profile.logo}
                    alt="Logo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  initials || '🏪'
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h2
                    style={{
                      fontFamily: 'var(--font-display, serif)',
                      fontSize: '24px',
                      fontWeight: 400,
                      color: 'var(--color-text-primary)',
                      margin: 0,
                    }}
                  >
                    {businessName}
                  </h2>
                  {profile && (
                    <Badge variant={getStatusBadgeVariant(profile.status)} size="md">
                      {profile.status}
                    </Badge>
                  )}
                </div>
                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                  {profile?.businessEmail || session?.email}
                  {profile?.businessPhone && ` · ${profile.businessPhone}`}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Navigation Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {[
          {
            href: '/vendor/profile',
            title: 'Business Profile',
            icon: '🏢',
            desc: 'Update official company contacts and legal details',
          },
          {
            href: '/vendor/store',
            title: 'Storefront Info',
            icon: '🏪',
            desc: 'Customize public shop bio, store logo, and branding',
          },
          {
            href: '/vendor/settings',
            title: 'Store Settings',
            icon: '⚙️',
            desc: 'View authoritative account status & approval state',
          },
          {
            href: '/products',
            title: 'Public Catalog',
            icon: '🛍️',
            desc: 'View how your store products appear to customers',
          },
        ].map((card) => (
          <Link key={card.href} href={card.href} style={{ textDecoration: 'none' }}>
            <Card
              variant="default"
              padding="md"
              style={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.borderColor = 'var(--color-terracotta-500)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              <CardContent>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{card.icon}</div>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    marginBottom: '6px',
                  }}
                >
                  {card.title}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  {card.desc}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
