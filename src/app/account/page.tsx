'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageTitle } from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { getSession, clearSession } from '@/lib/auth/client-session';
import { fetchCustomerProfile } from '@/lib/api/customer-api';
import { getInitials } from '@/lib/utils/formatting';
import type { CustomerProfileEntity } from '@/modules/customer/customer.types';

export default function AccountOverviewPage() {
  const router = useRouter();
  const session = getSession();
  const [profile, setProfile] = useState<CustomerProfileEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.replace('/login');
      return;
    }
    if (session.role !== 'CUSTOMER') {
      router.replace('/vendor');
      return;
    }
    fetchCustomerProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setIsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = () => {
    clearSession();
    router.replace('/');
  };

  const displayName =
    profile?.displayName ||
    [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') ||
    session?.email ||
    'Customer';

  const initials = getInitials(displayName);

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Account' }]} />
      <PageTitle
        title="Account Overview"
        description="Manage your profile, addresses, and account settings."
      >
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Sign Out
        </Button>
      </PageTitle>

      {/* Profile Identity Card */}
      <Card variant="default" padding="lg" style={{ marginBottom: '24px' }}>
        <CardContent>
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <Skeleton width="72px" height="72px" borderRadius="50%" />
              <div style={{ flex: 1 }}>
                <Skeleton width="40%" height="22px" style={{ marginBottom: '8px' }} />
                <Skeleton width="60%" height="16px" />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {/* Avatar */}
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-pistachio-light)',
                  border: '2px solid var(--color-pistachio-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display, serif)',
                  fontSize: '24px',
                  fontWeight: 600,
                  color: 'var(--color-pistachio-dark)',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}
              >
                {profile?.profileImage ? (
                  <img src={profile.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  initials || '👤'
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <h2
                  style={{
                    fontFamily: 'var(--font-display, serif)',
                    fontSize: '22px',
                    fontWeight: 400,
                    color: 'var(--color-text-primary)',
                    margin: '0 0 4px',
                  }}
                >
                  {displayName}
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: 0 }}>
                  {session?.email}
                </p>
              </div>

              <Badge variant="pistachio" size="md">
                Customer
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        {[
          { href: '/account/profile', label: 'Edit Profile', icon: '👤', desc: 'Update your name and photo' },
          { href: '/account/addresses', label: 'My Addresses', icon: '📍', desc: 'Manage shipping addresses' },
          { href: '/account/security', label: 'Security', icon: '🔒', desc: 'Password and account security' },
          { href: '/products', label: 'Browse Store', icon: '🛍️', desc: 'Discover artisan products' },
        ].map((item) => (
          <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            <Card
              variant="default"
              padding="md"
              style={{
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                height: '100%',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.borderColor = 'var(--color-pistachio-500)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              <CardContent>
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>{item.icon}</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{item.desc}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
