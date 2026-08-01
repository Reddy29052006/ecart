/**
 * Customer API Client.
 * Connects frontend to /api/v1/customers/* endpoints.
 * All calls are authenticated via Authorization: Bearer header.
 */

import { getAccessToken } from '@/lib/auth/client-session';
import type { CustomerProfileEntity, AddressEntity } from '@/modules/customer/customer.types';
import type {
  UpdateCustomerProfileDto,
  CreateAddressDto,
  UpdateAddressDto,
} from '@/modules/customer/customer.dto';

class CustomerApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fields?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'CustomerApiError';
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
    throw new CustomerApiError(
      body?.message || `Request failed (${res.status})`,
      res.status,
      body?.errors
    );
  }
  return body.data as T;
}

// ── Profile ────────────────────────────────────────────────

export async function fetchCustomerProfile(): Promise<CustomerProfileEntity> {
  const res = await authFetch('/api/v1/customers/me');
  return parseResponse<CustomerProfileEntity>(res);
}

export async function updateCustomerProfile(
  dto: UpdateCustomerProfileDto
): Promise<CustomerProfileEntity> {
  const res = await authFetch('/api/v1/customers/me', {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
  return parseResponse<CustomerProfileEntity>(res);
}

// ── Addresses ──────────────────────────────────────────────

export async function fetchAddresses(): Promise<AddressEntity[]> {
  const res = await authFetch('/api/v1/customers/addresses');
  return parseResponse<AddressEntity[]>(res);
}

export async function createAddress(dto: CreateAddressDto): Promise<AddressEntity> {
  const res = await authFetch('/api/v1/customers/addresses', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  return parseResponse<AddressEntity>(res);
}

export async function updateAddress(
  id: string,
  dto: UpdateAddressDto
): Promise<AddressEntity> {
  const res = await authFetch(`/api/v1/customers/addresses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
  return parseResponse<AddressEntity>(res);
}

export async function deleteAddress(id: string): Promise<void> {
  const res = await authFetch(`/api/v1/customers/addresses/${id}`, {
    method: 'DELETE',
  });
  await parseResponse<null>(res);
}

export { CustomerApiError };
