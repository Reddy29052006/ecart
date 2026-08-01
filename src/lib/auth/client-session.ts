/**
 * Client-side session utilities.
 * The access token is stored in localStorage (client only).
 * The refresh token is stored in an httpOnly cookie (server-managed).
 *
 * This file is client-safe: no Prisma, no server-only imports.
 */

'use client';

export const ACCESS_TOKEN_KEY = 'eg_access_token';
export const USER_ROLE_KEY = 'eg_user_role';
export const USER_EMAIL_KEY = 'eg_user_email';
export const USER_ID_KEY = 'eg_user_id';

export interface ClientSession {
  userId: string;
  email: string;
  role: 'CUSTOMER' | 'VENDOR';
  accessToken: string;
}

export function saveSession(session: ClientSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(USER_ROLE_KEY, session.role);
  localStorage.setItem(USER_EMAIL_KEY, session.email);
  localStorage.setItem(USER_ID_KEY, session.userId);
}

export function getSession(): ClientSession | null {
  if (typeof window === 'undefined') return null;
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const role = localStorage.getItem(USER_ROLE_KEY) as 'CUSTOMER' | 'VENDOR' | null;
  const email = localStorage.getItem(USER_EMAIL_KEY);
  const userId = localStorage.getItem(USER_ID_KEY);
  if (!accessToken || !role || !email || !userId) return null;
  return { accessToken, role, email, userId };
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
  localStorage.removeItem(USER_ID_KEY);
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}
