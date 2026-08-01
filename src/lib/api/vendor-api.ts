/**
 * Vendor API Client.
 * Connects frontend to /api/v1/vendors/* endpoints.
 * All calls are authenticated via Authorization: Bearer header.
 */

import { getAccessToken } from '@/lib/auth/client-session';
import type { VendorProfileEntity, VendorStatusType } from '@/modules/vendor/vendor.types';
import type { UpdateVendorProfileDto } from '@/modules/vendor/vendor.dto';

export class VendorApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fields?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'VendorApiError';
  }
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

async function parseResponse<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new VendorApiError(
      body?.message || `Request failed (${res.status})`,
      res.status,
      body?.errors
    );
  }
  return body.data as T;
}

// ── Profile ────────────────────────────────────────────────

export async function fetchVendorProfile(): Promise<VendorProfileEntity> {
  const res = await authFetch('/api/v1/vendors/profile');
  return parseResponse<VendorProfileEntity>(res);
}

export async function updateVendorProfile(
  dto: UpdateVendorProfileDto
): Promise<VendorProfileEntity> {
  const res = await authFetch('/api/v1/vendors/profile', {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
  return parseResponse<VendorProfileEntity>(res);
}

// ── Status ─────────────────────────────────────────────────

export async function updateVendorStatus(
  status: VendorStatusType
): Promise<VendorProfileEntity> {
  const res = await authFetch('/api/v1/vendors/me/status', {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return parseResponse<VendorProfileEntity>(res);
}
