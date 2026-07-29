import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError, ForbiddenError } from '@/lib/errors/app-error';
import { requireRole } from '@/lib/auth/permissions';
import { updateVendorStatusSchema } from '@/modules/vendor';

// PATCH /api/v1/vendors/me/status — Vendor self-update status (e.g. INACTIVE / SUSPENDED)
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'VENDOR');

    const body = await request.json();
    const result = updateVendorStatusSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    if (result.data.status === 'ACTIVE') {
      throw new ForbiddenError('Vendors cannot activate their own account. Administrative approval is required.');
    }

    const updated = await container.vendorService.updateStatus(user.userId, result.data.status);
    return ApiResponse.success(updated, `Vendor status updated to ${result.data.status}`);
  } catch (error) {
    return handleApiError(error);
  }
}
