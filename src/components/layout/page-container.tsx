import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  /** Limit content width to max-width token. Default: true. */
  constrain?: boolean;
  /** Top & bottom vertical padding. Default: 'lg' (48px). */
  vPad?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: React.CSSProperties;
}

const vPadMap = {
  none: '0px',
  sm: '16px',
  md: '32px',
  lg: '48px',
  xl: '80px',
};

export function PageContainer({
  children,
  constrain = true,
  vPad = 'lg',
  className = '',
  style,
}: PageContainerProps) {
  return (
    <div
      className={constrain ? `container ${className}` : className}
      style={{
        paddingTop: vPadMap[vPad],
        paddingBottom: vPadMap[vPad],
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Page Title Block
// ──────────────────────────────────────────────────────────

interface PageTitleProps {
  title: string;
  description?: string;
  children?: React.ReactNode; // slot for right-side actions
}

export function PageTitle({ title, description, children }: PageTitleProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '32px',
      }}
    >
      <div>
        <h1
          style={{
            fontSize: '2.25rem',
            fontFamily: 'var(--font-display, serif)',
            fontWeight: 400,
            color: 'var(--color-text-primary)',
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            style={{
              fontSize: '16px',
              color: 'var(--color-text-secondary)',
              marginTop: '8px',
              marginBottom: 0,
            }}
          >
            {description}
          </p>
        )}
      </div>
      {children && <div style={{ flexShrink: 0 }}>{children}</div>}
    </div>
  );
}
