'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageTitle } from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { FormField, FormError, FormSuccess } from '@/components/forms/form-field';
import { getSession } from '@/lib/auth/client-session';
import {
  fetchVendorProfile,
  updateVendorProfile,
  VendorApiError,
} from '@/lib/api/vendor-api';
import type { VendorProfileEntity } from '@/modules/vendor/vendor.types';

export default function VendorProfilePage() {
  const router = useRouter();
  const session = getSession();

  const [, setProfile] = useState<VendorProfileEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    businessName: '',
    businessPhone: '',
    businessEmail: '',
    logo: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
      setForm({
        businessName: data.businessName || '',
        businessPhone: data.businessPhone || '',
        businessEmail: data.businessEmail || session.email || '',
        logo: data.logo || '',
      });
    } catch {
      // If no profile exists yet, prefill email from session
      setForm((f) => ({ ...f, businessEmail: session?.email || '' }));
    } finally {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setFieldErrors((e) => ({ ...e, [field]: '' }));
    setGlobalError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      const updated = await updateVendorProfile({
        businessName: form.businessName || undefined,
        businessPhone: form.businessPhone || undefined,
        businessEmail: form.businessEmail || undefined,
        logo: form.logo || undefined,
      });
      setProfile(updated);
      setSuccessMessage('Business profile details updated successfully.');
    } catch (err) {
      if (err instanceof VendorApiError) {
        if (err.fields) {
          const mapped: Record<string, string> = {};
          Object.entries(err.fields).forEach(([k, v]) => {
            mapped[k] = v[0];
          });
          setFieldErrors(mapped);
        } else {
          setGlobalError(err.message);
        }
      } else {
        setGlobalError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Vendor Portal', href: '/vendor' },
          { label: 'Business Profile' },
        ]}
      />

      <PageTitle
        title="Business Profile"
        description="Manage official company name, primary business email, phone, and brand logo."
      />

      <Card variant="default" padding="lg">
        <CardContent>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Skeleton width="100%" height="42px" />
              <Skeleton width="100%" height="42px" />
              <Skeleton width="100%" height="42px" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {globalError && <FormError message={globalError} style={{ marginBottom: '20px' }} />}
              {successMessage && (
                <FormSuccess message={successMessage} style={{ marginBottom: '20px' }} />
              )}

              <FormField
                label="Business Name"
                htmlFor="businessName"
                required
                hint="Official operating or trade name for your artisan business."
                error={fieldErrors.businessName}
                style={{ marginBottom: '20px' }}
              >
                <Input
                  id="businessName"
                  type="text"
                  placeholder="e.g. Earth & Clay Ceramics"
                  value={form.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  aria-invalid={Boolean(fieldErrors.businessName)}
                />
              </FormField>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                  marginBottom: '20px',
                }}
              >
                <FormField
                  label="Business Email"
                  htmlFor="businessEmail"
                  hint="Primary contact email for customer inquiries & order updates."
                  error={fieldErrors.businessEmail}
                >
                  <Input
                    id="businessEmail"
                    type="email"
                    placeholder="contact@artisan.com"
                    value={form.businessEmail}
                    onChange={(e) => handleChange('businessEmail', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.businessEmail)}
                  />
                </FormField>

                <FormField
                  label="Business Phone"
                  htmlFor="businessPhone"
                  hint="Phone number in international format (+91...)."
                  error={fieldErrors.businessPhone}
                >
                  <Input
                    id="businessPhone"
                    type="tel"
                    placeholder="+919876543210"
                    value={form.businessPhone}
                    onChange={(e) => handleChange('businessPhone', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.businessPhone)}
                  />
                </FormField>
              </div>

              <FormField
                label="Brand Logo URL"
                htmlFor="logo"
                hint="Direct URL for your official store icon or logo."
                error={fieldErrors.logo}
                style={{ marginBottom: '28px' }}
              >
                <Input
                  id="logo"
                  type="url"
                  placeholder="https://..."
                  value={form.logo}
                  onChange={(e) => handleChange('logo', e.target.value)}
                  aria-invalid={Boolean(fieldErrors.logo)}
                />
              </FormField>

              <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
                Save Profile
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </>
  );
}
