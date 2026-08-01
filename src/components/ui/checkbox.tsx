import React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, checked, disabled, className = '', id, style, ...props }, ref) => {
    const checkboxId = id || (typeof label === 'string' ? `cb-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label
          htmlFor={checkboxId}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            color: disabled ? 'var(--color-text-disabled)' : 'var(--color-text-primary)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            userSelect: 'none',
          }}
        >
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            checked={checked}
            disabled={disabled}
            className={className}
            style={{
              width: '18px',
              height: '18px',
              accentColor: 'var(--color-pistachio-dark)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              borderRadius: '4px',
              ...style,
            }}
            {...props}
          />
          {label && <span>{label}</span>}
        </label>
        {error && (
          <span style={{ fontSize: '12px', color: 'var(--color-terracotta-500)', paddingLeft: '28px' }}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
