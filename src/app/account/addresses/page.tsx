'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageTitle } from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { FormField, FormError } from '@/components/forms/form-field';
import { getSession } from '@/lib/auth/client-session';
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  CustomerApiError,
} from '@/lib/api/customer-api';
import type { AddressEntity } from '@/modules/customer/customer.types';
import type { CreateAddressDto, UpdateAddressDto } from '@/modules/customer/customer.dto';

type AddressForm = {
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

const EMPTY_FORM: AddressForm = {
  label: '',
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'IN',
  isDefault: false,
};

export default function AddressesPage() {
  const router = useRouter();
  const session = getSession();

  const [addresses, setAddresses] = useState<AddressEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form / dialog state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadAddresses = useCallback(async () => {
    if (!session) { router.replace('/login'); return; }
    if (session.role !== 'CUSTOMER') { router.replace('/vendor'); return; }
    try {
      const data = await fetchAddresses();
      setAddresses(data);
    } catch {
      setGlobalError('Failed to load addresses.');
    } finally {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadAddresses(); }, [loadAddresses]);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFieldErrors({});
    setGlobalError(null);
    setShowForm(true);
  };

  const openEdit = (addr: AddressEntity) => {
    setForm({
      label: addr.label || '',
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      isDefault: addr.isDefault,
    });
    setEditingId(addr.id);
    setFieldErrors({});
    setGlobalError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setGlobalError(null);
  };

  const handleChange = (field: keyof AddressForm, value: string | boolean) => {
    setForm((f) => ({ ...f, [field]: value }));
    setFieldErrors((e) => ({ ...e, [field]: '' }));
    setGlobalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setIsSaving(true);

    const dto: CreateAddressDto | UpdateAddressDto = {
      label: form.label || undefined,
      fullName: form.fullName,
      phone: form.phone,
      addressLine1: form.addressLine1,
      addressLine2: form.addressLine2 || undefined,
      city: form.city,
      state: form.state,
      postalCode: form.postalCode,
      country: form.country || 'IN',
      isDefault: form.isDefault,
    };

    try {
      if (editingId) {
        const updated = await updateAddress(editingId, dto as UpdateAddressDto);
        setAddresses((prev) =>
          prev.map((a) => (a.id === editingId ? updated : a))
        );
      } else {
        const created = await createAddress(dto as CreateAddressDto);
        setAddresses((prev) => [...prev, created]);
      }
      closeForm();
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
        setGlobalError('An unexpected error occurred.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this address?')) return;
    setDeletingId(id);
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setGlobalError('Failed to delete address.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Account', href: '/account' },
          { label: 'Addresses' },
        ]}
      />
      <PageTitle
        title="My Addresses"
        description="Manage shipping addresses for your orders."
      >
        <Button variant="primary" size="sm" onClick={openNew}>
          + Add Address
        </Button>
      </PageTitle>

      {globalError && !showForm && (
        <FormError message={globalError} style={{ marginBottom: '20px' }} />
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <Card variant="default" padding="lg" style={{ marginBottom: '28px', border: '2px solid var(--color-pistachio-500)' }}>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-display, serif)', fontSize: '20px', fontWeight: 400, margin: 0 }}>
                {editingId ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                onClick={closeForm}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--color-text-muted)' }}
                aria-label="Close form"
              >
                ✕
              </button>
            </div>

            {globalError && <FormError message={globalError} style={{ marginBottom: '16px' }} />}

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <FormField label="Label" htmlFor="label" hint="e.g. Home, Office" error={fieldErrors.label}>
                  <Input id="label" value={form.label} onChange={(e) => handleChange('label', e.target.value)} placeholder="Home" />
                </FormField>
                <FormField label="Full Name" htmlFor="fullName" required error={fieldErrors.fullName}>
                  <Input id="fullName" value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} placeholder="Recipient's full name" aria-invalid={Boolean(fieldErrors.fullName)} />
                </FormField>
              </div>

              <FormField label="Phone" htmlFor="phone" required error={fieldErrors.phone} style={{ marginBottom: '16px' }}>
                <Input id="phone" type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+91..." aria-invalid={Boolean(fieldErrors.phone)} />
              </FormField>

              <FormField label="Address Line 1" htmlFor="addressLine1" required error={fieldErrors.addressLine1} style={{ marginBottom: '16px' }}>
                <Input id="addressLine1" value={form.addressLine1} onChange={(e) => handleChange('addressLine1', e.target.value)} placeholder="Street address, P.O. box" aria-invalid={Boolean(fieldErrors.addressLine1)} />
              </FormField>

              <FormField label="Address Line 2" htmlFor="addressLine2" error={fieldErrors.addressLine2} style={{ marginBottom: '16px' }}>
                <Input id="addressLine2" value={form.addressLine2} onChange={(e) => handleChange('addressLine2', e.target.value)} placeholder="Apartment, suite, floor (optional)" />
              </FormField>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <FormField label="City" htmlFor="city" required error={fieldErrors.city}>
                  <Input id="city" value={form.city} onChange={(e) => handleChange('city', e.target.value)} placeholder="City" aria-invalid={Boolean(fieldErrors.city)} />
                </FormField>
                <FormField label="State / Province" htmlFor="state" required error={fieldErrors.state}>
                  <Input id="state" value={form.state} onChange={(e) => handleChange('state', e.target.value)} placeholder="State" aria-invalid={Boolean(fieldErrors.state)} />
                </FormField>
                <FormField label="Postal Code" htmlFor="postalCode" required error={fieldErrors.postalCode}>
                  <Input id="postalCode" value={form.postalCode} onChange={(e) => handleChange('postalCode', e.target.value)} placeholder="000000" aria-invalid={Boolean(fieldErrors.postalCode)} />
                </FormField>
              </div>

              <FormField label="Country" htmlFor="country" error={fieldErrors.country} style={{ marginBottom: '20px' }}>
                <Input id="country" value={form.country} onChange={(e) => handleChange('country', e.target.value)} placeholder="IN" />
              </FormField>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={form.isDefault}
                  onChange={(e) => handleChange('isDefault', e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--color-pistachio-dark)' }}
                />
                <label htmlFor="isDefault" style={{ fontSize: '14px', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
                  Set as default address
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
                  {editingId ? 'Save Changes' : 'Add Address'}
                </Button>
                <Button type="button" variant="outline" size="md" onClick={closeForm} disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Address List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2].map((i) => (
            <Card key={i} variant="default" padding="md">
              <CardContent>
                <Skeleton width="40%" height="20px" style={{ marginBottom: '10px' }} />
                <Skeleton width="80%" height="16px" style={{ marginBottom: '6px' }} />
                <Skeleton width="60%" height="16px" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState
          title="No addresses saved"
          description="Add a shipping address so you can checkout quickly."
          action={<Button variant="primary" size="sm" onClick={openNew}>Add Your First Address</Button>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {addresses.map((addr) => (
            <Card
              key={addr.id}
              variant="default"
              padding="md"
              style={{ border: addr.isDefault ? '1px solid var(--color-pistachio-500)' : '1px solid var(--color-border)' }}
            >
              <CardContent>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {addr.label || 'Address'}
                      </span>
                      {addr.isDefault && <Badge variant="pistachio" size="sm">Default</Badge>}
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
                      {addr.fullName}<br />
                      {addr.addressLine1}
                      {addr.addressLine2 && <>, {addr.addressLine2}</>}<br />
                      {addr.city}, {addr.state} {addr.postalCode}<br />
                      {addr.country} · {addr.phone}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(addr)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      isLoading={deletingId === addr.id}
                      onClick={() => handleDelete(addr.id)}
                      style={{ color: 'var(--color-terracotta-500)' }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
