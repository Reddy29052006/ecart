'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Badge } from '@/components/ui/badge';

interface NavLink {
  href: string;
  label: string;
}

const storefrontLinks: NavLink[] = [
  { href: '/products', label: 'Shop' },
  { href: '/categories', label: 'Collections' },
];

const customerLinks: NavLink[] = [
  { href: '/products', label: 'Shop' },
  { href: '/categories', label: 'Collections' },
  { href: '/orders', label: 'Orders' },
  { href: '/account', label: 'Account' },
];

const vendorLinks: NavLink[] = [
  { href: '/vendor', label: 'Dashboard' },
  { href: '/vendor/products', label: 'Products' },
  { href: '/vendor/inventory', label: 'Inventory' },
  { href: '/vendor/orders', label: 'Orders' },
];

export function Navigation() {
  const { isCustomer, isVendor } = useAuth();
  const pathname = usePathname();

  const links = isVendor ? vendorLinks : isCustomer ? customerLinks : storefrontLinks;

  return (
    <nav
      aria-label="Main navigation"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '28px',
      }}
    >
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(link.href + '/');

        return (
          <Link
            key={link.href}
            href={link.href}
            style={{
              position: 'relative',
              fontSize: '14px',
              fontWeight: 600,
              color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              textDecoration: 'none',
              paddingBottom: '4px',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.color = 'var(--color-berry-500)';
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            {link.label}
            {isActive && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: 0,
                  right: 0,
                  height: '3px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--color-pistachio-500)',
                }}
              />
            )}
          </Link>
        );
      })}

      {isVendor && (
        <Badge variant="pistachio" size="sm">
          Vendor
        </Badge>
      )}
    </nav>
  );
}
