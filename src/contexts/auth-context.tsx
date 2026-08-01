'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getSession,
  saveSession,
  clearSession,
  type ClientSession,
} from '@/lib/auth/client-session';

// ──────────────────────────────────────────────────────────
// Context Shape
// ──────────────────────────────────────────────────────────

export interface AuthContextValue {
  session: ClientSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isCustomer: boolean;
  isVendor: boolean;
  login: (session: ClientSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ──────────────────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<ClientSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate session from localStorage on mount
  useEffect(() => {
    const stored = getSession();
    setSession(stored);
    setIsLoading(false);
  }, []);

  const login = useCallback((newSession: ClientSession) => {
    saveSession(newSession);
    setSession(newSession);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const value: AuthContextValue = {
    session,
    isLoading,
    isAuthenticated: Boolean(session),
    isCustomer: session?.role === 'CUSTOMER',
    isVendor: session?.role === 'VENDOR',
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ──────────────────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
