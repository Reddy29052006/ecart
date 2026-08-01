'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormField, FormError } from '@/components/forms/form-field';
import { useAuth } from '@/contexts/auth-context';
import { login, selectRole, ApiError } from '@/lib/api/auth-api';
import type { AuthResponseDto } from '@/modules/auth/auth.dto';
import type { ClientSession } from '@/lib/auth/client-session';

// Note: metadata must be in a server component — using a client component here for form interactivity.

// ──────────────────────────────────────────────────────────
// Form State Types
// ──────────────────────────────────────────────────────────

type Stage = 'credentials' | 'role-selection';

interface CredentialsForm {
  email: string;
  password: string;
}

interface FieldErrors {
  email?: string;
  password?: string;
}

// ──────────────────────────────────────────────────────────
// Page Component
// ──────────────────────────────────────────────────────────

export default function LoginPage() {
  const { login: storeSession } = useAuth();
  const router = useRouter();

  // Stage 1 — credentials
  const [form, setForm] = useState<CredentialsForm>({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stage 2 — role selection (dual-role accounts)
  const [stage, setStage] = useState<Stage>('credentials');
  const [selectionToken, setSelectionToken] = useState<string | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Array<'CUSTOMER' | 'VENDOR'>>([]);
  const [pendingUser, setPendingUser] = useState<AuthResponseDto['user'] | null>(null);

  // ── Client-side validation ──

  const validate = useCallback((): boolean => {
    const errors: FieldErrors = {};
    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!form.password) {
      errors.password = 'Password is required';
    } else if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form.email, form.password]);

  // ── Submit credentials ──

  const handleCredentials = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setServerError(null);
      if (!validate()) return;

      setIsSubmitting(true);
      try {
        const response = await login({ email: form.email, password: form.password });

        if (response.requiresRoleSelection && response.selectionToken) {
          // Dual-role account — go to role selection stage
          setSelectionToken(response.selectionToken);
          setAvailableRoles((response.availableRoles ?? []) as Array<'CUSTOMER' | 'VENDOR'>);
          setPendingUser(response.user ?? null);
          setStage('role-selection');
        } else if (response.tokens && response.user) {
          // Single-role — log in immediately
          const session: ClientSession = {
            userId: response.user.id,
            email: response.user.email,
            role: (response.user.activeRole ?? response.user.roles[0]) as 'CUSTOMER' | 'VENDOR',
            accessToken: response.tokens.accessToken,
          };
          storeSession(session);
          router.push(session.role === 'VENDOR' ? '/vendor' : '/');
        } else {
          setServerError('Unexpected response from server. Please try again.');
        }
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 401) {
            setServerError('Incorrect email or password. Please try again.');
          } else {
            setServerError(err.message);
          }
        } else {
          setServerError('An unexpected error occurred. Please try again.');
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, validate, storeSession, router]
  );

  // ── Select role ──

  const handleSelectRole = useCallback(
    async (role: 'CUSTOMER' | 'VENDOR') => {
      if (!selectionToken) return;
      setIsSubmitting(true);
      setServerError(null);
      try {
        const response = await selectRole({ selectionToken, role });
        if (response.tokens && response.user) {
          const session: ClientSession = {
            userId: response.user.id,
            email: response.user.email,
            role,
            accessToken: response.tokens.accessToken,
          };
          storeSession(session);
          router.push(role === 'VENDOR' ? '/vendor' : '/');
        } else {
          setServerError('Unexpected response. Please try again.');
        }
      } catch (err) {
        if (err instanceof ApiError) {
          setServerError(err.message);
        } else {
          setServerError('An unexpected error occurred. Please try again.');
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectionToken, storeSession, router]
  );

  // ──────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────

  if (stage === 'role-selection') {
    return <RoleSelection
      email={pendingUser?.email ?? form.email}
      availableRoles={availableRoles}
      isSubmitting={isSubmitting}
      serverError={serverError}
      onSelect={handleSelectRole}
      onBack={() => { setStage('credentials'); setServerError(null); }}
    />;
  }

  return (
    <div className="animate-fade-in">
      {/* Heading */}
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display, serif)',
            fontSize: '2rem',
            fontWeight: 400,
            color: 'var(--color-text-primary)',
            margin: '0 0 8px',
          }}
        >
          Welcome back
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '15px' }}>
          Sign in to your account to continue.
        </p>
      </div>

      {/* Server error */}
      <FormError message={serverError} />

      {/* Form */}
      <form
        onSubmit={handleCredentials}
        noValidate
        style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: serverError ? '20px' : '0' }}
      >
        <FormField id="email" label="Email address" required error={fieldErrors.email}>
          <Input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            aria-invalid={Boolean(fieldErrors.email)}
            disabled={isSubmitting}
          />
        </FormField>

        <FormField id="password" label="Password" required error={fieldErrors.password}>
          <Input
            id="password"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            aria-invalid={Boolean(fieldErrors.password)}
            disabled={isSubmitting}
          />
        </FormField>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          disabled={isSubmitting}
          style={{ marginTop: '4px' }}
        >
          Sign In
        </Button>
      </form>

      {/* Register links */}
      <div
        style={{
          marginTop: '28px',
          paddingTop: '24px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            style={{ color: 'var(--color-pistachio-dark)', fontWeight: 600, textDecoration: 'none' }}
          >
            Create one
          </Link>
        </p>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
          Want to sell on ECART?{' '}
          <Link
            href="/register?role=vendor"
            style={{ color: 'var(--color-berry-500)', fontWeight: 600, textDecoration: 'none' }}
          >
            Apply as a vendor
          </Link>
        </p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Role Selection sub-view
// ──────────────────────────────────────────────────────────

function RoleSelection({
  email,
  availableRoles,
  isSubmitting,
  serverError,
  onSelect,
  onBack,
}: {
  email: string;
  availableRoles: Array<'CUSTOMER' | 'VENDOR'>;
  isSubmitting: boolean;
  serverError: string | null;
  onSelect: (role: 'CUSTOMER' | 'VENDOR') => void;
  onBack: () => void;
}) {
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display, serif)',
            fontSize: '2rem',
            fontWeight: 400,
            color: 'var(--color-text-primary)',
            margin: '0 0 8px',
          }}
        >
          Choose your role
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '15px' }}>
          Your account (<strong>{email}</strong>) has multiple roles. Which would you like to use?
        </p>
      </div>

      <FormError message={serverError} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
        {availableRoles.includes('CUSTOMER') && (
          <button
            onClick={() => onSelect('CUSTOMER')}
            disabled={isSubmitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px',
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
              opacity: isSubmitting ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-pistachio-500)';
              e.currentTarget.style.backgroundColor = 'var(--color-pistachio-light)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.backgroundColor = 'var(--color-bg-card)';
            }}
          >
            <span style={{ fontSize: '32px', lineHeight: 1 }}>🛍️</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                Continue as Customer
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                Browse products, manage orders, and shop
              </div>
            </div>
          </button>
        )}

        {availableRoles.includes('VENDOR') && (
          <button
            onClick={() => onSelect('VENDOR')}
            disabled={isSubmitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px',
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
              opacity: isSubmitting ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-berry-500)';
              e.currentTarget.style.backgroundColor = 'var(--color-berry-light)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.backgroundColor = 'var(--color-bg-card)';
            }}
          >
            <span style={{ fontSize: '32px', lineHeight: 1 }}>🏪</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                Continue as Vendor
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                Manage your store, products, and orders
              </div>
            </div>
          </button>
        )}
      </div>

      <button
        onClick={onBack}
        disabled={isSubmitting}
        style={{
          marginTop: '24px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          padding: 0,
          textDecoration: 'underline',
        }}
      >
        ← Back to sign in
      </button>
    </div>
  );
}
