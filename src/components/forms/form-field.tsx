'use client';

import React from 'react';

// ──────────────────────────────────────────────────────────
// FormField — wraps label + input + error message
// ──────────────────────────────────────────────────────────

interface FormFieldProps {
  id?: string;
  /** Alias for `id` for ergonomics — one of id or htmlFor must be set. */
  htmlFor?: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
  style?: React.CSSProperties;
  className?: string;
}

export function FormField({
  id,
  htmlFor,
  label,
  required,
  error,
  children,
  hint,
  style,
  className,
}: FormFieldProps) {
  const inputId = id ?? htmlFor;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...style }} className={className}>
      <label
        htmlFor={inputId}
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color: error ? 'var(--color-terracotta-500)' : 'var(--color-text-primary)',
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
        }}
      >
        {label}
        {required && (
          <span aria-hidden="true" style={{ color: 'var(--color-terracotta-500)', fontSize: '12px' }}>
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>{hint}</p>
      )}
      {error && (
        <p
          id={inputId ? `${inputId}-error` : undefined}
          role="alert"
          style={{ fontSize: '12px', color: 'var(--color-terracotta-500)', margin: 0 }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// FormError — top-level server / general error display
// ──────────────────────────────────────────────────────────

export interface FormErrorProps {
  message?: string | null;
  style?: React.CSSProperties;
  className?: string;
}

export function FormError({ message, style, className }: FormErrorProps) {
  if (!message) return null;
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={className}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        backgroundColor: 'var(--color-terracotta-light)',
        border: '1px solid rgba(198,93,69,0.3)',
        borderRadius: 'var(--radius-sm)',
        padding: '12px 14px',
        ...style,
      }}
    >
      <span style={{ flexShrink: 0, fontSize: '16px' }}>⚠️</span>
      <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-terracotta-dark)', lineHeight: 1.5 }}>
        {message}
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// FormSuccess — top-level success message
// ──────────────────────────────────────────────────────────

export interface FormSuccessProps {
  message?: string | null;
  style?: React.CSSProperties;
  className?: string;
}

export function FormSuccess({ message, style, className }: FormSuccessProps) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={className}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        backgroundColor: 'var(--color-success-bg)',
        border: '1px solid var(--color-pistachio-dark)',
        borderRadius: 'var(--radius-sm)',
        padding: '12px 14px',
        ...style,
      }}
    >
      <span style={{ flexShrink: 0, fontSize: '16px' }}>✅</span>
      <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-pistachio-dark)', lineHeight: 1.5 }}>
        {message}
      </p>
    </div>
  );
}
