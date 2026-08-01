'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageTitle } from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FormField, FormError, FormSuccess } from '@/components/forms/form-field';
import { getSession } from '@/lib/auth/client-session';
import {
  fetchVendorProfile,
  updateVendorProfile,
  VendorApiError,
} from '@/lib/api/vendor-api';
import { getInitials } from '@/lib/utils/formatting';
import type { VendorProfileEntity } from '@/modules/vendor/vendor.types';

export default function VendorStorePage() {
  const router = useRouter();
  const session = getSession();

  const [profile, setProfile] = useState<VendorProfileEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [description, setDescription] = useState('');

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
      setDescription(data.businessDescription || '');
    } catch {
      // Profile empty fallback
    } finally {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      const updated = await updateVendorProfile({
        businessDescription: description || undefined,
      });
      setProfile(updated);
      setSuccessMessage('Storefront description saved successfully.');
    } catch (err) {
      if (err instanceof VendorApiError) {
        setGlobalError(err.message);
      } else {
        setGlobalError('An unexpected error occurred while saving.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const businessName = profile?.businessName || 'Artisan Workshop';
  const initials = getInitials(businessName);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Vendor Portal', href: '/vendor' },
          { label: 'Storefront Info' },
        ]}
      />

      <PageTitle
        title="Storefront Information"
        description="Craft your public studio story and preview how customer product cards present your brand."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '24px',
          alignItems: 'flex-start',
        }}
      >
        {/* Main Store Form */}
        <Card variant="default" padding="lg">
          <CardContent>
            {isLoading ? (
              <Skeleton width="100%" height="180px" />
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {globalError && <FormError message={globalError} style={{ marginBottom: '20px' }} />}
                {successMessage && (
                  <FormSuccess message={successMessage} style={{ marginBottom: '20px' }} />
                )}

                <FormField
                  label="Studio Bio & Craft Story"
                  htmlFor="businessDescription"
                  hint="Describe your sustainable materials, technique, and workshop story."
                  style={{ marginBottom: '24px' }}
                >
                  <textarea
                    id="businessDescription"
                    rows={6}
                    placeholder="Tell customers about your handcrafted process..."
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setGlobalError(null);
                      setSuccessMessage(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      fontSize: '14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg-card)',
                      color: 'var(--color-text-primary)',
                      outline: 'none',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </FormField>

                <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
                  Save Store Info
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Live Public Preview Card */}
        <div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-text-muted)',
              marginBottom: '12px',
            }}
          >
            Live Storefront Preview
          </div>

          <Card
            variant="default"
            padding="md"
            style={{
              border: '1px solid var(--color-terracotta-500)',
              backgroundColor: 'var(--color-bg-secondary)',
            }}
          >
            <CardContent>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-terracotta-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display, serif)',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: 'var(--color-terracotta-dark)',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {profile?.logo ? (
                    <img src={profile.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    initials || '🎨'
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {businessName}
                  </div>
                  <Badge variant="pistachio" size="sm" style={{ marginTop: '2px' }}>
                    Verified Artisan
                  </Badge>
                </div>
              </div>

              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.5,
                  margin: '0 0 16px',
                  fontStyle: description ? 'normal' : 'italic',
                }}
              >
                {description || 'No studio description provided yet.'}
              </p>

              <Link href={`/products?brand=${encodeURIComponent(businessName)}`}>
                <Button variant="outline" size="sm" style={{ width: '100%' }}>
                  View Public Products →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
