import React from 'react';
import { Alert, AlertProps } from './alert';

export interface ToastMessage {
  id: string;
  variant?: AlertProps['variant'];
  title?: string;
  message: string;
}

export interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '380px',
        width: '100%',
      }}
    >
      {toasts.map((t) => (
        <div key={t.id} className="animate-fade-in" style={{ boxShadow: 'var(--shadow-md)' }}>
          <Alert variant={t.variant} title={t.title} onDismiss={() => onDismiss(t.id)}>
            {t.message}
          </Alert>
        </div>
      ))}
    </div>
  );
};
