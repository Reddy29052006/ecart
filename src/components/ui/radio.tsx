import React from 'react';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  selectedValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  selectedValue,
  onChange,
  label,
  error,
  disabled = false,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      {label && (
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {label}
        </span>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          const isOptionDisabled = disabled || option.disabled;

          return (
            <label
              key={option.value}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isSelected ? 'var(--color-pistachio-light)' : 'var(--color-bg-card)',
                border: `1px solid ${
                  isSelected ? 'var(--color-pistachio-dark)' : 'var(--color-border)'
                }`,
                cursor: isOptionDisabled ? 'not-allowed' : 'pointer',
                opacity: isOptionDisabled ? 0.6 : 1,
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                disabled={isOptionDisabled}
                onChange={() => onChange && onChange(option.value)}
                style={{
                  marginTop: '3px',
                  width: '18px',
                  height: '18px',
                  accentColor: 'var(--color-pistachio-dark)',
                  cursor: isOptionDisabled ? 'not-allowed' : 'pointer',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {option.label}
                </span>
                {option.description && (
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {option.description}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {error && (
        <span style={{ fontSize: '13px', color: 'var(--color-terracotta-500)', fontWeight: 500 }}>
          {error}
        </span>
      )}
    </div>
  );
};
