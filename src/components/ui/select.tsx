import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: string;
  placeholder?: string;
  isRequired?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      helperText,
      error,
      placeholder,
      isRequired = false,
      disabled,
      className = '',
      id,
      style,
      value,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
        {label && (
          <label
            htmlFor={selectId}
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

        <div style={{ position: 'relative', width: '100%' }}>
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            value={value}
            aria-invalid={Boolean(error)}
            className={className}
            style={{
              width: '100%',
              height: '44px',
              paddingLeft: '14px',
              paddingRight: '36px',
              fontSize: '15px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: disabled ? 'var(--color-bg-secondary)' : 'var(--color-bg-card)',
              color: disabled ? 'var(--color-text-disabled)' : 'var(--color-text-primary)',
              border: `1px solid ${
                error ? 'var(--color-terracotta-500)' : 'var(--color-border)'
              }`,
              appearance: 'none',
              outline: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              ...style,
            }}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <span
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: 'var(--color-text-muted)',
              fontSize: '12px',
            }}
          >
            ▼
          </span>
        </div>

        {error && (
          <span style={{ fontSize: '13px', color: 'var(--color-terracotta-500)', fontWeight: 500 }}>
            {error}
          </span>
        )}

        {!error && helperText && (
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{helperText}</span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
