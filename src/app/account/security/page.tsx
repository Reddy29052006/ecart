'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageTitle } from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getSession, clearSession } from '@/lib/auth/client-session';

export default function SecurityPage() {
  const router = useRouter();
  const session = getSession();

  const handleLogout = () => {
    clearSession();
    router.replace('/');
  };

  if (!session || session.role !== 'CUSTOMER') {
    if (typeof window !== 'undefined') router.replace('/login');
    return null;
  }

  const securityItems = [
    {
      icon: '📧',
      label: 'Email Address',
      value: session.email,
      status: 'Verified',
      statusVariant: 'success' as const,
      action: null,
      note: 'Your email cannot be changed here. Contact support to update your email.',
    },
    {
      icon: '🔑',
      label: 'Password',
      value: '••••••••••••',
      status: 'Set',
      statusVariant: 'pistachio' as const,
      action: null,
      note: 'Password change is coming in a future update. Contact support for assistance.',
    },
    {
      icon: '🎭',
      label: 'Active Role',
      value: 'CUSTOMER',
      status: 'Active',
      statusVariant: 'success' as const,
      action: null,
      note: 'You are currently signed in as a Customer.',
    },
  ];

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Account', href: '/account' },
          { label: 'Security' },
        ]}
      />
      <PageTitle
        title="Account Security"
        description="Review your account security settings and active session."
      />

      {/* Security Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {securityItems.map((item) => (
          <Card key={item.label} variant="default" padding="md">
            <CardContent>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <span style={{ fontSize: '24px', flexShrink: 0, marginTop: '2px' }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                      {item.value}
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
                      {item.note}
                    </p>
                  </div>
                </div>
                <Badge variant={item.statusVariant} size="md">
                  {item.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Danger Zone */}
      <Card
        variant="default"
        padding="lg"
        style={{
          border: '1px solid rgba(198, 93, 69, 0.35)',
          backgroundColor: 'var(--color-terracotta-light)',
        }}
      >
        <CardContent>
          <h3
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: '20px',
              fontWeight: 400,
              color: 'var(--color-terracotta-dark)',
              margin: '0 0 8px',
            }}
          >
            Sign Out of Your Account
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0 0 20px' }}>
            This will end your current session. Your data and orders will remain safe and accessible
            when you sign back in.
          </p>
          <Button
            variant="berry"
            size="md"
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
