'use client';

import React from 'react';
import Link from 'next/link';

const footerLinks = {
  Shop: [
    { href: '/products', label: 'All Products' },
    { href: '/categories', label: 'Collections' },
  ],
  Account: [
    { href: '/account', label: 'My Account' },
    { href: '/orders', label: 'My Orders' },
    { href: '/account/addresses', label: 'Addresses' },
  ],
  Vendors: [
    { href: '/vendor', label: 'Vendor Dashboard' },
    { href: '/register', label: 'Become a Vendor' },
  ],
};

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderTop: '1px solid var(--color-border)',
        paddingTop: '56px',
        paddingBottom: '32px',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        {/* Top section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '40px',
            marginBottom: '48px',
          }}
        >
          {/* Brand Column */}
          <div>
            <Link
              href="/"
              style={{
                fontFamily: 'var(--font-display, serif)',
                fontSize: '24px',
                fontWeight: 400,
                color: 'var(--color-text-primary)',
                textDecoration: 'none',
                display: 'block',
                marginBottom: '12px',
                letterSpacing: '-0.02em',
              }}
            >
              ECART
            </Link>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                maxWidth: '240px',
              }}
            >
              A curated marketplace for organic, artisanal, and sustainably crafted goods.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-sans, sans-serif)',
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '16px',
                }}
              >
                {section}
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      style={{
                        fontSize: '14px',
                        color: 'var(--color-text-secondary)',
                        textDecoration: 'none',
                        fontWeight: 500,
                        transition: 'color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div
          style={{
            height: '1px',
            backgroundColor: 'var(--color-border)',
            marginBottom: '24px',
          }}
        />

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            © {year} ECART. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['Privacy Policy', 'Terms of Service'].map((label) => (
              <Link
                key={label}
                href="#"
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text-muted)',
                  textDecoration: 'none',
                  transition: 'color 0.1s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
