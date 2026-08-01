'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormField, FormError, FormSuccess } from '@/components/forms/form-field';
import { useAuth } from '@/contexts/auth-context';
import { registerCustomer, registerVendor, ApiError } from '@/lib/api/auth-api';
import type { ClientSession } from '@/lib/auth/client-session';

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

type AccountType = 'customer' | 'vendor';

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

interface FieldErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
}

// ──────────────────────────────────────────────────────────
// Page Component
// ──────────────────────────────────────────────────────────

export default function RegisterPage() {
  const { login: storeSession } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Default to vendor if ?role=vendor in URL
  const initialType: AccountType =
    searchParams.get('role') === 'vendor' ? 'vendor' : 'customer';

  const [accountType, setAccountType] = useState<AccountType>(initialType);
  const [form, setForm] = useState<RegisterForm>({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset errors when switching account type
  useEffect(() => {
    setFieldErrors({});
    setServerError(null);
    setSuccessMessage(null);
  }, [accountType]);

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
    } else if (!/[A-Z]/.test(form.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(form.password)) {
      errors.password = 'Password must contain at least one number';
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (form.phone && !/^\+?[\d\s\-()]{7,15}$/.test(form.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  // ── Submit ──

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setServerError(null);
      setSuccessMessage(null);
      if (!validate()) return;

      setIsSubmitting(true);
      try {
        const payload = {
          email: form.email.trim().toLowerCase(),
          password: form.password,
          ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
        };

        const response =
          accountType === 'vendor'
            ? await registerVendor(payload)
            : await registerCustomer(payload);

        if (accountType === 'vendor') {
          // Vendor accounts require admin approval — show pending message
          setSuccessMessage(
            'Your vendor application has been submitted! Our team will review it and you\'ll be notified once approved.'
          );
        } else if (response.tokens && response.user) {
          // Customer — auto-login
          const session: ClientSession = {
            userId: response.user.id,
            email: response.user.email,
            role: 'CUSTOMER',
            accessToken: response.tokens.accessToken,
          };
          storeSession(session);
          router.push('/');
        } else {
          setSuccessMessage('Account created successfully! You can now sign in.');
        }
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 409) {
            // Duplicate email — give context-aware message
            setServerError(
              accountType === 'vendor'
                ? 'An account with this email already exists. If you already have a customer account, you can add the vendor role by logging in and applying.'
                : 'An account with this email already exists. Please sign in or use a different email.'
            );
          } else if (err.fieldErrors) {
            const mapped: FieldErrors = {};
            if (err.fieldErrors.email?.[0]) mapped.email = err.fieldErrors.email[0];
            if (err.fieldErrors.password?.[0]) mapped.password = err.fieldErrors.password[0];
            setFieldErrors(mapped);
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
    [form, accountType, validate, storeSession, router]
  );

  // ──────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in">
      {/* Heading */}
      <div style={{ marginBottom: '28px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display, serif)',
            fontSize: '2rem',
            fontWeight: 400,
            color: 'var(--color-text-primary)',
            margin: '0 0 8px',
          }}
        >
          Create your account
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '15px' }}>
          Join the ECART community today.
        </p>
      </div>

      {/* Account type toggle */}
      <div
        role="group"
        aria-label="Account type"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          marginBottom: '28px',
        }}
      >
        {(['customer', 'vendor'] as const).map((type) => (
          <button
            key={type}
            type="button"
            aria-pressed={accountType === type}
            onClick={() => setAccountType(type)}
            style={{
              padding: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              borderRight: type === 'customer' ? '1px solid var(--color-border)' : 'none',
              transition: 'all 0.15s ease',
              backgroundColor:
                accountType === type ? 'var(--color-text-primary)' : 'var(--color-bg-card)',
              color:
                accountType === type ? 'var(--color-bg-main)' : 'var(--color-text-secondary)',
            }}
          >
            {type === 'customer' ? '🛍️ Customer' : '🏪 Vendor'}
          </button>
        ))}
      </div>

      {/* Vendor pending info */}
      {accountType === 'vendor' && (
        <div
          style={{
            backgroundColor: 'var(--color-pistachio-light)',
            border: '1px solid rgba(113,139,84,0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            marginBottom: '20px',
            fontSize: '13px',
            color: 'var(--color-pistachio-dark)',
            lineHeight: 1.5,
          }}
        >
          🌿 <strong>Vendor applications</strong> are reviewed by our team. Your account will be
          in <em>Pending</em> status until approved. You won&apos;t be able to list products until
          activated.
        </div>
      )}

      {/* Feedback */}
      <FormError message={serverError} />
      <FormSuccess message={successMessage} />

      {!successMessage && (
        <form
          onSubmit={handleSubmit}
          noValidate
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            marginTop: serverError ? '20px' : '0',
          }}
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

          <FormField
            id="phone"
            label="Phone number"
            hint="Optional — helps with order notifications"
            error={fieldErrors.phone}
          >
            <Input
              id="phone"
              type="tel"
              name="phone"
              autoComplete="tel"
              placeholder="+1 555 000 0000"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
              aria-invalid={Boolean(fieldErrors.phone)}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField
            id="password"
            label="Password"
            required
            hint="Min 8 characters, one uppercase, one number"
            error={fieldErrors.password}
          >
            <Input
              id="password"
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              aria-describedby={fieldErrors.password ? 'password-error' : 'password-hint'}
              aria-invalid={Boolean(fieldErrors.password)}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField
            id="confirmPassword"
            label="Confirm password"
            required
            error={fieldErrors.confirmPassword}
          >
            <Input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined}
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              disabled={isSubmitting}
            />
          </FormField>

          <Button
            type="submit"
            variant={accountType === 'vendor' ? 'berry' : 'primary'}
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            disabled={isSubmitting}
            style={{ marginTop: '4px' }}
          >
            {accountType === 'vendor' ? 'Apply as Vendor' : 'Create Account'}
          </Button>

          <p
            style={{
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              margin: '4px 0 0',
              lineHeight: 1.5,
            }}
          >
            By creating an account you agree to our{' '}
            <Link href="#" style={{ color: 'var(--color-text-secondary)' }}>Terms of Service</Link>{' '}
            and{' '}
            <Link href="#" style={{ color: 'var(--color-text-secondary)' }}>Privacy Policy</Link>.
          </p>
        </form>
      )}

      {/* Sign-in link */}
      <div
        style={{
          marginTop: '28px',
          paddingTop: '24px',
          borderTop: '1px solid var(--color-border)',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
          Already have an account?{' '}
          <Link
            href="/login"
            style={{ color: 'var(--color-pistachio-dark)', fontWeight: 600, textDecoration: 'none' }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
