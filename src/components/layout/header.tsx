'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Navigation } from './navigation';
import { Button } from '@/components/ui/button';

export function Header() {
  const { isAuthenticated, isVendor, isCustomer, session, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Track scroll for header shadow
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 'var(--header-height)',
        backgroundColor: 'var(--color-bg-main)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: isScrolled ? 'var(--shadow-sm)' : 'none',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      <div
        className="container"
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="ECART — Go to homepage"
          style={{
            fontFamily: 'var(--font-display, serif)',
            fontSize: '22px',
            fontWeight: 400,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          ECART
        </Link>

        {/* Desktop Navigation — hidden on mobile */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="desktop-nav"
        >
          <Navigation />
        </div>

        {/* Desktop Right Actions */}
        <div
          className="desktop-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          {isAuthenticated ? (
            <>
              {isCustomer && (
                <Link href="/cart" aria-label="Shopping cart">
                  <Button variant="ghost" size="sm" style={{ padding: '0 10px', gap: '6px' }}>
                    <CartIcon />
                    Cart
                  </Button>
                </Link>
              )}
              <UserMenu email={session?.email ?? ''} isVendor={isVendor} onLogout={logout} />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="mobile-only"
          style={{
            background: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px',
            cursor: 'pointer',
            color: 'var(--color-text-primary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              display: 'block',
              width: '20px',
              height: '2px',
              backgroundColor: 'currentColor',
              borderRadius: '1px',
              transform: isMobileMenuOpen ? 'translateY(6px) rotate(45deg)' : 'none',
              transition: 'transform 0.2s ease',
            }}
          />
          <span
            style={{
              display: 'block',
              width: '20px',
              height: '2px',
              backgroundColor: 'currentColor',
              borderRadius: '1px',
              opacity: isMobileMenuOpen ? 0 : 1,
              transition: 'opacity 0.2s ease',
            }}
          />
          <span
            style={{
              display: 'block',
              width: '20px',
              height: '2px',
              backgroundColor: 'currentColor',
              borderRadius: '1px',
              transform: isMobileMenuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none',
              transition: 'transform 0.2s ease',
            }}
          />
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <MobileMenu
          isAuthenticated={isAuthenticated}
          isVendor={isVendor}
          email={session?.email}
          onLogout={() => { logout(); setIsMobileMenuOpen(false); }}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Responsive style utilities */}
      <style>{`
        .desktop-nav { display: flex; }
        .mobile-only { display: none; }

        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-only { display: flex !important; }
        }
      `}</style>
    </header>
  );
}

// ──────────────────────────────────────────────────────────────────
// User Menu Dropdown
// ──────────────────────────────────────────────────────────────────

function UserMenu({
  email,
  isVendor,
  onLogout,
}: {
  email: string;
  isVendor: boolean;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((p) => !p)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-full)',
          padding: '6px 12px',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-border-active)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
      >
        <AvatarIcon email={email} />
        <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {email.split('@')[0]}
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div
          className="animate-fade-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: '200px',
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            padding: '6px',
            zIndex: 60,
          }}
        >
          <div
            style={{
              padding: '8px 12px 10px',
              borderBottom: '1px solid var(--color-border)',
              marginBottom: '4px',
            }}
          >
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>Signed in as</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', wordBreak: 'break-word' }}>{email}</div>
          </div>
          {isVendor ? (
            <>
              <MenuLink href="/vendor" label="Vendor Dashboard" onClick={() => setOpen(false)} />
              <MenuLink href="/vendor/profile" label="Vendor Profile" onClick={() => setOpen(false)} />
            </>
          ) : (
            <>
              <MenuLink href="/account" label="My Account" onClick={() => setOpen(false)} />
              <MenuLink href="/account/addresses" label="Addresses" onClick={() => setOpen(false)} />
              <MenuLink href="/orders" label="Orders" onClick={() => setOpen(false)} />
            </>
          )}
          <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '4px 0' }} />
          <button
            onClick={() => { onLogout(); setOpen(false); }}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '10px 12px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--color-terracotta-500)',
              background: 'none',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Sign Out
          </button>
        </div>
      )}

      {/* Close menu on outside click */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 59 }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Mobile Menu Drawer
// ──────────────────────────────────────────────────────────────────

function MobileMenu({
  isAuthenticated,
  isVendor,
  email,
  onLogout,
  onClose,
}: {
  isAuthenticated: boolean;
  isVendor: boolean;
  email?: string;
  onLogout: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="animate-fade-in"
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'var(--color-bg-card)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-md)',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        zIndex: 49,
      }}
    >
      {isVendor ? (
        <>
          <MobileLink href="/vendor" label="Dashboard" onClick={onClose} />
          <MobileLink href="/vendor/products" label="Products" onClick={onClose} />
          <MobileLink href="/vendor/inventory" label="Inventory" onClick={onClose} />
          <MobileLink href="/vendor/orders" label="Orders" onClick={onClose} />
        </>
      ) : (
        <>
          <MobileLink href="/products" label="Shop" onClick={onClose} />
          <MobileLink href="/categories" label="Collections" onClick={onClose} />
          {isAuthenticated && <MobileLink href="/cart" label="Cart" onClick={onClose} />}
          {isAuthenticated && <MobileLink href="/orders" label="Orders" onClick={onClose} />}
          {isAuthenticated && <MobileLink href="/account" label="Account" onClick={onClose} />}
        </>
      )}

      <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '8px 0' }} />

      {isAuthenticated ? (
        <>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', padding: '4px 0' }}>
            Signed in as <strong>{email}</strong>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout} style={{ marginTop: '8px', width: '100%' }}>
            Sign Out
          </Button>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          <Link href="/login" onClick={onClose}>
            <Button variant="outline" size="sm" fullWidth>Sign In</Button>
          </Link>
          <Link href="/register" onClick={onClose}>
            <Button variant="primary" size="sm" fullWidth>Get Started</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────

function MenuLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: 'block',
        padding: '10px 12px',
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--color-text-primary)',
        borderRadius: 'var(--radius-sm)',
        textDecoration: 'none',
        transition: 'background-color 0.1s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {label}
    </Link>
  );
}

function MobileLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: 'block',
        padding: '12px 0',
        fontSize: '16px',
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        textDecoration: 'none',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {label}
    </Link>
  );
}

function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function AvatarIcon({ email }: { email: string }) {
  const initials = email ? email[0].toUpperCase() : '?';
  return (
    <span
      style={{
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-pistachio-light)',
        color: 'var(--color-pistachio-dark)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
        fontWeight: 700,
      }}
    >
      {initials}
    </span>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      style={{
        transform: open ? 'rotate(180deg)' : 'rotate(0)',
        transition: 'transform 0.15s ease',
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
