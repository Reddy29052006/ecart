import React from 'react';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'pistachio' | 'terracotta' | 'berry' | 'olive' | 'white';
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'pistachio',
  className = '',
  style,
  ...props
}) => {
  const sizePx = size === 'sm' ? 16 : size === 'lg' ? 32 : 24;
  const strokeWidth = size === 'sm' ? 3 : 2.5;

  const colorMap: Record<NonNullable<SpinnerProps['variant']>, string> = {
    pistachio: 'var(--color-pistachio-dark)',
    terracotta: 'var(--color-terracotta-500)',
    berry: 'var(--color-berry-500)',
    olive: 'var(--color-text-primary)',
    white: '#FFFFFF',
  };

  const strokeColor = colorMap[variant];

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-spin inline-block ${className}`}
      style={{
        width: sizePx,
        height: sizePx,
        ...style,
      }}
      {...props}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeOpacity="0.2"
        />
        <path
          d="M12 2A10 10 0 0 1 22 12"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
