import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--radius-sm)',
  circle = false,
  className = '',
  style,
  ...props
}) => {
  return (
    <div
      className={`animate-pulse ${className}`}
      style={{
        width,
        height,
        borderRadius: circle ? '50%' : borderRadius,
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        ...style,
      }}
      {...props}
    />
  );
};

export const SkeletonCard: React.FC = () => (
  <div
    style={{
      padding: '20px',
      borderRadius: 'var(--radius-md)',
      backgroundColor: 'var(--color-bg-card)',
      border: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      width: '100%',
    }}
  >
    <Skeleton height="180px" borderRadius="var(--radius-md)" />
    <Skeleton width="40%" height="16px" />
    <Skeleton width="80%" height="24px" />
    <Skeleton width="60%" height="20px" />
  </div>
);
