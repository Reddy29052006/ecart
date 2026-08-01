import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isRequired?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      isRequired = false,
      disabled,
      className = '',
      id,
      style,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {label}
            {isRequired && <span style={{ color: 'var(--color-terracotta-500)' }}>*</span>}
          </label>
        )}

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
          {leftIcon && (
            <span
              style={{
                position: 'absolute',
                left: '12px',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--color-text-muted)',
                pointerEvents: 'none',
              }}
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId || helperId}
            className={className}
            style={{
              width: '100%',
              height: '44px',
              paddingLeft: leftIcon ? '40px' : '14px',
              paddingRight: rightIcon ? '40px' : '14px',
              fontSize: '15px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: disabled ? 'var(--color-bg-secondary)' : 'var(--color-bg-card)',
              color: disabled ? 'var(--color-text-disabled)' : 'var(--color-text-primary)',
              border: `1px solid ${
                error ? 'var(--color-terracotta-500)' : 'var(--color-border)'
              }`,
              outline: 'none',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              opacity: disabled ? 0.7 : 1,
              ...style,
            }}
            {...props}
          />

          {rightIcon && (
            <span
              style={{
                position: 'absolute',
                right: '12px',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--color-text-muted)',
              }}
            >
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <span
            id={errorId}
            role="alert"
            style={{
              fontSize: '13px',
              color: 'var(--color-terracotta-500)',
              fontWeight: 500,
            }}
          >
            {error}
          </span>
        )}

        {!error && helperText && (
          <span
            id={helperId}
            style={{
              fontSize: '13px',
              color: 'var(--color-text-muted)',
            }}
          >
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
