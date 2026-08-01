'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AccountLink {
  href: string;
  label: string;
  icon: string;
}

const NAV_LINKS: AccountLink[] = [
  { href: '/account', label: 'Overview', icon: '🏠' },
  { href: '/account/profile', label: 'Profile', icon: '👤' },
  { href: '/account/addresses', label: 'Addresses', icon: '📍' },
  { href: '/account/security', label: 'Security', icon: '🔒' },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border)',
          fontFamily: 'var(--font-display, serif)',
          fontSize: '18px',
          color: 'var(--color-text-primary)',
          fontWeight: 400,
        }}
      >
        My Account
      </div>

      <ul style={{ listStyle: 'none', margin: 0, padding: '8px 0' }}>
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '11px 20px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--color-pistachio-dark)' : 'var(--color-text-secondary)',
                  backgroundColor: isActive ? 'var(--color-pistachio-light)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--color-pistachio-dark)' : '3px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '16px' }}>{link.icon}</span>
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
