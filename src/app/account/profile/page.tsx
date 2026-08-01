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
  fetchCustomerProfile,
  updateCustomerProfile,
  CustomerApiError,
} from '@/lib/api/customer-api';
import { getInitials } from '@/lib/utils/formatting';
import type { CustomerProfileEntity } from '@/modules/customer/customer.types';

export default function ProfilePage() {
  const router = useRouter();
  const session = getSession();

  const [profile, setProfile] = useState<CustomerProfileEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    profileImage: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const loadProfile = useCallback(async () => {
    if (!session) { router.replace('/login'); return; }
    if (session.role !== 'CUSTOMER') { router.replace('/vendor'); return; }
    try {
      const data = await fetchCustomerProfile();
      setProfile(data);
      setForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        displayName: data.displayName || '',
        profileImage: data.profileImage || '',
      });
    } catch {
      setGlobalError('Failed to load your profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadProfile(); }, [loadProfile]);

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
      const updated = await updateCustomerProfile({
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        displayName: form.displayName || undefined,
        profileImage: form.profileImage || undefined,
      });
      setProfile(updated);
      setSuccessMessage('Your profile has been updated successfully.');
    } catch (err) {
      if (err instanceof CustomerApiError) {
        if (err.fields) {
          const mapped: Record<string, string> = {};
          Object.entries(err.fields).forEach(([k, v]) => { mapped[k] = v[0]; });
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

  const displayName =
    profile?.displayName ||
    [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') ||
    session?.email ||
    'Customer';

  const initials = getInitials(displayName);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Account', href: '/account' },
          { label: 'Profile' },
        ]}
      />
      <PageTitle title="Edit Profile" description="Update your name and display preferences." />

      <Card variant="default" padding="lg">
        <CardContent>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Skeleton width="80px" height="80px" borderRadius="50%" />
              <Skeleton width="100%" height="42px" />
              <Skeleton width="100%" height="42px" />
              <Skeleton width="100%" height="42px" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {/* Avatar Preview */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  marginBottom: '32px',
                  paddingBottom: '24px',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-pistachio-light)',
                    border: '2px solid var(--color-pistachio-500)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display, serif)',
                    fontSize: '26px',
                    fontWeight: 600,
                    color: 'var(--color-pistachio-dark)',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {form.profileImage ? (
                    <img src={form.profileImage} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    initials || '👤'
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {displayName}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {session?.email}
                  </div>
                </div>
              </div>

              {globalError && <FormError message={globalError} style={{ marginBottom: '20px' }} />}
              {successMessage && <FormSuccess message={successMessage} style={{ marginBottom: '20px' }} />}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <FormField
                  label="First Name"
                  htmlFor="firstName"
                  error={fieldErrors.firstName}
                >
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="e.g. Alex"
                    value={form.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.firstName)}
                  />
                </FormField>

                <FormField
                  label="Last Name"
                  htmlFor="lastName"
                  error={fieldErrors.lastName}
                >
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="e.g. Smith"
                    value={form.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.lastName)}
                  />
                </FormField>
              </div>

              <FormField
                label="Display Name"
                htmlFor="displayName"
                hint="This is how your name appears on the platform."
                error={fieldErrors.displayName}
                style={{ marginBottom: '20px' }}
              >
                <Input
                  id="displayName"
                  type="text"
                  placeholder="e.g. Alex S."
                  value={form.displayName}
                  onChange={(e) => handleChange('displayName', e.target.value)}
                  aria-invalid={Boolean(fieldErrors.displayName)}
                />
              </FormField>

              <FormField
                label="Profile Image URL"
                htmlFor="profileImage"
                hint="Paste a direct link to your profile photo."
                error={fieldErrors.profileImage}
                style={{ marginBottom: '28px' }}
              >
                <Input
                  id="profileImage"
                  type="url"
                  placeholder="https://..."
                  value={form.profileImage}
                  onChange={(e) => handleChange('profileImage', e.target.value)}
                  aria-invalid={Boolean(fieldErrors.profileImage)}
                />
              </FormField>

              <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
                Save Changes
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </>
  );
}
