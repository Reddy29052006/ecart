import React from 'react';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  style?: React.CSSProperties;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onDismiss,
  style,
}) => {
  const variantStyles: Record<NonNullable<AlertProps['variant']>, React.CSSProperties> = {
    info: {
      backgroundColor: 'var(--color-info-bg)',
      color: 'var(--color-info-text)',
      border: '1px solid rgba(39, 86, 107, 0.3)',
    },
    success: {
      backgroundColor: 'var(--color-success-bg)',
      color: 'var(--color-success-text)',
      border: '1px solid var(--color-pistachio-dark)',
    },
    warning: {
      backgroundColor: 'var(--color-warning-bg)',
      color: 'var(--color-warning-text)',
      border: '1px solid var(--color-border-active)',
    },
    error: {
      backgroundColor: 'var(--color-error-bg)',
      color: 'var(--color-error-text)',
      border: '1px solid var(--color-terracotta-500)',
    },
  };

  const icons = {
    info: 'ℹ',
    success: '✓',
    warning: '⚠',
    error: '✕',
  };

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 18px',
        borderRadius: 'var(--radius-md)',
        fontSize: '14px',
        width: '100%',
        ...variantStyles[variant],
        ...style,
      }}
    >
      <span style={{ fontSize: '16px', fontWeight: 'bold', lineHeight: 1.2 }}>
        {icons[variant]}
      </span>
      <div style={{ flex: 1 }}>
        {title && (
          <div style={{ fontWeight: 700, marginBottom: '2px', fontSize: '15px' }}>{title}</div>
        )}
        <div>{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss alert"
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '16px',
            lineHeight: 1,
            opacity: 0.7,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};
