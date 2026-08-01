import React from 'react';
import { Spinner } from './spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'terracotta' | 'berry' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    // Style configurations based on variant
    const variantStyles: Record<NonNullable<ButtonProps['variant']>, React.CSSProperties> = {
      primary: {
        backgroundColor: 'var(--color-pistachio-500)',
        color: 'var(--color-text-primary)',
        border: '1px solid var(--color-pistachio-dark)',
      },
      secondary: {
        backgroundColor: 'var(--color-text-primary)',
        color: 'var(--color-bg-main)',
        border: '1px solid var(--color-text-primary)',
      },
      terracotta: {
        backgroundColor: 'var(--color-terracotta-500)',
        color: '#FFFFFF',
        border: '1px solid var(--color-terracotta-dark)',
      },
      berry: {
        backgroundColor: 'var(--color-berry-500)',
        color: '#FFFFFF',
        border: '1px solid var(--color-berry-dark)',
      },
      outline: {
        backgroundColor: 'transparent',
        color: 'var(--color-text-primary)',
        border: '1px solid var(--color-border-active)',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'var(--color-text-primary)',
        border: '1px solid transparent',
      },
      danger: {
        backgroundColor: 'var(--color-error-bg)',
        color: 'var(--color-error-text)',
        border: '1px solid var(--color-terracotta-500)',
      },
    };

    // Size configurations
    const sizeStyles: Record<NonNullable<ButtonProps['size']>, React.CSSProperties> = {
      sm: {
        height: '36px',
        padding: '0 14px',
        fontSize: '13px',
        borderRadius: 'var(--radius-sm)',
      },
      md: {
        height: '44px',
        padding: '0 20px',
        fontSize: '14px',
        borderRadius: 'var(--radius-md)',
      },
      lg: {
        height: '52px',
        padding: '0 28px',
        fontSize: '15px',
        borderRadius: 'var(--radius-md)',
      },
    };

    const isInteractionDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isInteractionDisabled}
        className={`inline-flex items-center justify-center font-bold tracking-wide transition-all duration-150 ease-in-out cursor-pointer select-none ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          letterSpacing: '0.01em',
          transition: 'all 0.15s ease-in-out',
          cursor: isInteractionDisabled ? 'not-allowed' : 'pointer',
          opacity: isInteractionDisabled ? 0.65 : 1,
          width: fullWidth ? '100%' : 'auto',
          ...variantStyles[variant],
          ...sizeStyles[size],
          ...style,
        }}
        {...props}
      >
        {isLoading ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Spinner size={size === 'lg' ? 'md' : 'sm'} variant={variant === 'primary' ? 'olive' : 'white'} />
            <span>Loading...</span>
          </span>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            {leftIcon && <span style={{ display: 'inline-flex' }}>{leftIcon}</span>}
            {children}
            {rightIcon && <span style={{ display: 'inline-flex' }}>{rightIcon}</span>}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
