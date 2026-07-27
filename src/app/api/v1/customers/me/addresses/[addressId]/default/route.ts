import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { requireAuth, requireRole } from '@/lib/auth/permissions';

// PATCH /api/v1/customers/me/addresses/[addressId]/default — Set default address
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ addressId: string }> }
): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'CUSTOMER');
    const { addressId } = await params;

    const updated = await container.customerService.setDefaultAddress(addressId, user.userId);
    return ApiResponse.success(updated, 'Default address updated');
  } catch (error) {
    return handleApiError(error);
  }
}
