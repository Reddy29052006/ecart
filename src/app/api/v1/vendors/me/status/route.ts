import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/app-error';
import { requireAuth, requireRole } from '@/lib/auth/permissions';
import { updateVendorStatusSchema } from '@/modules/vendor/vendor.validation';

// PATCH /api/v1/vendors/me/status — Update vendor status (dev helper / transition)
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'VENDOR');

    const body = await request.json();
    const result = updateVendorStatusSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const updated = await container.vendorService.updateStatus(user.userId, result.data.status);
    return ApiResponse.success(updated, `Vendor status updated to ${result.data.status}`);
  } catch (error) {
    return handleApiError(error);
  }
}
