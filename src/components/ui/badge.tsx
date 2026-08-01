import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'pistachio' | 'terracotta' | 'berry' | 'olive' | 'outline' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'pistachio',
  size = 'md',
  className = '',
  style,
  ...props
}) => {
  const variantStyles: Record<NonNullable<BadgeProps['variant']>, React.CSSProperties> = {
    pistachio: {
      backgroundColor: 'var(--color-pistachio-light)',
      color: 'var(--color-pistachio-dark)',
      border: '1px solid rgba(113, 139, 84, 0.3)',
    },
    terracotta: {
      backgroundColor: 'var(--color-terracotta-light)',
      color: 'var(--color-terracotta-dark)',
      border: '1px solid rgba(198, 93, 69, 0.3)',
    },
    berry: {
      backgroundColor: 'var(--color-berry-light)',
      color: 'var(--color-berry-dark)',
      border: '1px solid rgba(142, 58, 89, 0.3)',
    },
    olive: {
      backgroundColor: 'var(--color-bg-secondary)',
      color: 'var(--color-text-primary)',
      border: '1px solid var(--color-border)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-primary)',
      border: '1px solid var(--color-border-active)',
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

  const sizeStyles: Record<NonNullable<BadgeProps['size']>, React.CSSProperties> = {
    sm: {
      padding: '2px 8px',
      fontSize: '11px',
    },
    md: {
      padding: '4px 12px',
      fontSize: '12px',
    },
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full uppercase tracking-wider ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontWeight: 600,
        borderRadius: 'var(--radius-full)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        width: 'fit-content',
        lineHeight: 1.2,
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
};
