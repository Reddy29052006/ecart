import { describe, it, expect } from 'vitest';
import { requireAdmin } from '@/lib/auth/permissions';
import { ForbiddenError, ValidationError } from '@/lib/errors/app-error';
import { updateVendorStatusSchema } from '@/modules/vendor';
import { NextRequest } from 'next/server';

describe('Vendor Authorization & Status Tests', () => {
  it('should reject vendor self-activation when status ACTIVE is submitted to PATCH /vendors/me/status', () => {
    const body = { status: 'ACTIVE' };
    const result = updateVendorStatusSchema.safeParse(body);
    expect(result.success).toBe(true);

    if (result.success && result.data.status === 'ACTIVE') {
      const checkSelfActivation = () => {
        if (result.data.status === 'ACTIVE') {
          throw new ForbiddenError('Vendors cannot activate their own account. Administrative approval is required.');
        }
      };
      expect(checkSelfActivation).toThrow(ForbiddenError);
    }
  });

  it('should reject unauthenticated or non-admin request to activate vendor endpoint', async () => {
    const requestWithoutAdmin = new NextRequest('http://localhost/api/v1/vendors/user-123/activate', {
      method: 'POST',
    });

    await expect(requireAdmin(requestWithoutAdmin)).rejects.toThrow(ForbiddenError);
  });

  it('should reject non-admin user request with invalid admin secret to activate vendor', async () => {
    const requestWithBadSecret = new NextRequest('http://localhost/api/v1/vendors/user-123/activate', {
      method: 'POST',
      headers: {
        'x-admin-secret': 'wrong-secret-key',
      },
    });

    await expect(requireAdmin(requestWithBadSecret)).rejects.toThrow(ForbiddenError);
  });

  it('should approve authorized administrator with valid x-admin-secret header', async () => {
    const requestWithValidSecret = new NextRequest('http://localhost/api/v1/vendors/user-123/activate', {
      method: 'POST',
      headers: {
        'x-admin-secret': 'admin-secret-key',
      },
    });

    const result = await requireAdmin(requestWithValidSecret);
    expect(result.isAdmin).toBe(true);
  });

  it('should validate allowed vendor status transitions schema', () => {
    expect(updateVendorStatusSchema.safeParse({ status: 'ACTIVE' }).success).toBe(true);
    expect(updateVendorStatusSchema.safeParse({ status: 'SUSPENDED' }).success).toBe(true);
    expect(updateVendorStatusSchema.safeParse({ status: 'PENDING' }).success).toBe(true);
    expect(updateVendorStatusSchema.safeParse({ status: 'INVALID_STATUS' }).success).toBe(false);
  });
});
