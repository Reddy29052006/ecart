import React from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        flexGrow: 1,
      }}
    >
      {/* Left panel — decorative */}
      <div
        aria-hidden="true"
        style={{
          background: 'linear-gradient(155deg, var(--color-pistachio-light) 0%, var(--color-bg-secondary) 60%, var(--color-berry-light) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Organic blob decoration */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '340px',
            height: '340px',
            borderRadius: '55% 45% 62% 38% / 50% 50% 52% 48%',
            backgroundColor: 'rgba(168,198,134,0.25)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-60px',
            left: '-60px',
            width: '260px',
            height: '260px',
            borderRadius: '40% 60% 45% 55% / 55% 40% 60% 45%',
            backgroundColor: 'rgba(142,58,89,0.12)',
            pointerEvents: 'none',
          }}
        />

        {/* Logo */}
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-display, serif)',
            fontSize: '24px',
            fontWeight: 400,
            color: 'var(--color-text-primary)',
            textDecoration: 'none',
            letterSpacing: '-0.02em',
            position: 'relative',
            zIndex: 1,
          }}
        >
          ECART
        </Link>

        {/* Tagline block */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: '2.5rem',
              fontWeight: 400,
              color: 'var(--color-text-primary)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              margin: '0 0 16px',
            }}
          >
            The digital garden marketplace.
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              maxWidth: '340px',
              margin: 0,
            }}
          >
            Handcrafted goods from independent artisans, delivered to your door.
          </p>

          {/* Testimonial */}
          <blockquote
            style={{
              marginTop: '32px',
              padding: '16px 20px',
              backgroundColor: 'rgba(248,241,229,0.7)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '3px solid var(--color-pistachio-500)',
              margin: '32px 0 0',
            }}
          >
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-text-secondary)',
                fontStyle: 'italic',
                margin: '0 0 8px',
                lineHeight: 1.6,
              }}
            >
              &ldquo;ECART connected me with customers who truly appreciate handmade ceramics. My sales tripled in the first quarter.&rdquo;
            </p>
            <footer
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}
            >
              — Maria S., Ceramic Vendor
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right panel — form content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px',
          backgroundColor: 'var(--color-bg-main)',
          overflowY: 'auto',
          minHeight: '100%',
        }}
      >
        <div style={{ maxWidth: '420px', width: '100%', margin: '0 auto' }}>
          {children}
        </div>
      </div>

      {/* Mobile: stack vertically */}
      <style>{`
        @media (max-width: 768px) {
          .auth-grid { grid-template-columns: 1fr !important; }
          .auth-deco { display: none !important; }
        }
      `}</style>
    </div>
  );
}
