import React from 'react';
import { Card } from './card';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  return (
    <Card
      variant="outline"
      padding="lg"
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        minHeight: '260px',
        width: '100%',
      }}
    >
      {icon && (
        <div
          style={{
            fontSize: '42px',
            color: 'var(--color-text-muted)',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      )}

      <h3
        style={{
          fontSize: '22px',
          fontWeight: 600,
          fontFamily: 'var(--font-display, serif)',
          color: 'var(--color-text-primary)',
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '15px',
          color: 'var(--color-text-secondary)',
          maxWidth: '420px',
          marginBottom: action ? '24px' : '0',
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>

      {action && <div>{action}</div>}
    </Card>
  );
};
