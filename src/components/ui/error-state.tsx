import React from 'react';
import { Card } from './card';
import { Button } from './button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <Card
      variant="default"
      padding="lg"
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        minHeight: '240px',
        backgroundColor: 'var(--color-error-bg)',
        border: '1px solid var(--color-terracotta-500)',
        width: '100%',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-terracotta-500)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '16px',
        }}
      >
        !
      </div>

      <h3
        style={{
          fontSize: '20px',
          fontWeight: 600,
          fontFamily: 'var(--font-display, serif)',
          color: 'var(--color-error-text)',
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '14px',
          color: 'var(--color-error-text)',
          maxWidth: '440px',
          marginBottom: onRetry ? '20px' : '0',
          opacity: 0.9,
        }}
      >
        {message}
      </p>

      {onRetry && (
        <Button variant="terracotta" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </Card>
  );
};
