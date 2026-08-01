/**
 * Centralised auth API client.
 * Talks to the existing backend route handlers.
 * No business logic — only request/response shaping.
 */

import type { AuthResponseDto } from '@/modules/auth/auth.dto';

// ──────────────────────────────────────────────────────────
// API Error helper
// ──────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fieldErrors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseApiError(res: Response): Promise<ApiError> {
  try {
    const body = await res.json();
    return new ApiError(
      res.status,
      body?.message ?? `Request failed (${res.status})`,
      body?.errors
    );
  } catch {
    return new ApiError(res.status, `Request failed (${res.status})`);
  }
}

// ──────────────────────────────────────────────────────────
// Register Customer
// POST /api/v1/auth/register
// ──────────────────────────────────────────────────────────

export interface RegisterCustomerPayload {
  email: string;
  password: string;
  phone?: string;
}

export async function registerCustomer(
  payload: RegisterCustomerPayload
): Promise<AuthResponseDto> {
  const res = await fetch('/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw await parseApiError(res);
  const body = await res.json();
  return body.data as AuthResponseDto;
}

// ──────────────────────────────────────────────────────────
// Register Vendor
// POST /api/v1/auth/vendor/register
// ──────────────────────────────────────────────────────────

export interface RegisterVendorPayload {
  email: string;
  password: string;
  phone?: string;
}

export async function registerVendor(
  payload: RegisterVendorPayload
): Promise<AuthResponseDto> {
  const res = await fetch('/api/v1/auth/vendor/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw await parseApiError(res);
  const body = await res.json();
  return body.data as AuthResponseDto;
}

// ──────────────────────────────────────────────────────────
// Login
// POST /api/v1/auth/login
// ──────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export async function login(payload: LoginPayload): Promise<AuthResponseDto> {
  const res = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw await parseApiError(res);
  const body = await res.json();
  return body.data as AuthResponseDto;
}

// ──────────────────────────────────────────────────────────
// Select Role  (dual-role accounts)
// POST /api/v1/auth/select-role
// ──────────────────────────────────────────────────────────

export interface SelectRolePayload {
  selectionToken: string;
  role: 'CUSTOMER' | 'VENDOR';
}

export async function selectRole(
  payload: SelectRolePayload
): Promise<AuthResponseDto> {
  const res = await fetch('/api/v1/auth/select-role', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw await parseApiError(res);
  const body = await res.json();
  return body.data as AuthResponseDto;
}
