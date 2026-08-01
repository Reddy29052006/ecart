'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageTitle } from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FormError, FormSuccess } from '@/components/forms/form-field';
import { getSession } from '@/lib/auth/client-session';
import {
  fetchVendorProfile,
  updateVendorStatus,
  VendorApiError,
} from '@/lib/api/vendor-api';
import type { VendorProfileEntity, VendorStatusType } from '@/modules/vendor/vendor.types';

export default function VendorSettingsPage() {
  const router = useRouter();
  const session = getSession();

  const [profile, setProfile] = useState<VendorProfileEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      setGlobalError('Failed to fetch store status.');
    } finally {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSelfSuspend = async () => {
    if (!confirm('Are you sure you want to suspend your store listing? Public products will be hidden from shoppers until an administrator re-activates your account.')) {
      return;
    }

    setGlobalError(null);
    setSuccessMessage(null);
    setIsUpdating(true);

    try {
      const updated = await updateVendorStatus('SUSPENDED');
      setProfile(updated);
      setSuccessMessage('Store status updated to SUSPENDED. Your store products are now hidden.');
    } catch (err) {
      if (err instanceof VendorApiError) {
        setGlobalError(err.message);
      } else {
        setGlobalError('Failed to update status.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadgeVariant = (status: VendorStatusType) => {
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
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Vendor Portal', href: '/vendor' },
          { label: 'Store Settings' },
        ]}
      />

      <PageTitle
        title="Store Settings & Status"
        description="View administrative approval status and store lifecycle policies."
      />

      {globalError && <FormError message={globalError} style={{ marginBottom: '20px' }} />}
      {successMessage && <FormSuccess message={successMessage} style={{ marginBottom: '20px' }} />}

      {/* Account Status Card */}
      <Card variant="default" padding="lg" style={{ marginBottom: '24px' }}>
        <CardContent>
          <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
            Current Account Status
          </div>

          {isLoading ? (
            <Skeleton width="50%" height="32px" />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <Badge variant={getStatusBadgeVariant(profile?.status || 'PENDING')} size="md">
                {profile?.status || 'PENDING'}
              </Badge>

              <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                {profile?.status === 'ACTIVE' && 'Your store is active and verified on the marketplace.'}
                {profile?.status === 'PENDING' && 'Your store profile is under review by marketplace admins.'}
                {profile?.status === 'SUSPENDED' && 'Store listing is currently suspended.'}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Authoritative Policy Callout (NO Self-Activation Rule) */}
      <Card
        variant="default"
        padding="lg"
        style={{
          marginBottom: '24px',
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
        }}
      >
        <CardContent>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <span style={{ fontSize: '24px', flexShrink: 0 }}>🛡️</span>
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-display, serif)',
                  fontSize: '18px',
                  fontWeight: 400,
                  color: 'var(--color-text-primary)',
                  margin: '0 0 6px',
                }}
              >
                Administrative Authorization Policy
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                To maintain high quality standards across our artisan marketplace, account activation (
                <strong>ACTIVE</strong> status) is strictly controlled by marketplace administrators.
                Vendors cannot self-activate their accounts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voluntary Suspension Action */}
      {profile?.status !== 'SUSPENDED' && (
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
                fontSize: '18px',
                fontWeight: 400,
                color: 'var(--color-terracotta-dark)',
                margin: '0 0 8px',
              }}
            >
              Temporary Store Pause / Suspension
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.5,
                margin: '0 0 20px',
              }}
            >
              Need to pause sales? You can voluntarily set your store to <strong>SUSPENDED</strong>. Note:
              restoring an ACTIVE status afterwards requires administrative review.
            </p>
            <Button
              variant="berry"
              size="md"
              isLoading={isUpdating}
              onClick={handleSelfSuspend}
            >
              Suspend My Store
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
