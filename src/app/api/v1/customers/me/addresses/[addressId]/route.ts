import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/app-error';
import { requireAuth, requireRole } from '@/lib/auth/permissions';
import { updateAddressSchema } from '@/modules/customer/customer.validation';

// PUT /api/v1/customers/me/addresses/[addressId] — Update address
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ addressId: string }> }
): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'CUSTOMER');
    const { addressId } = await params;

    const body = await request.json();
    const result = updateAddressSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const updated = await container.customerService.updateAddress(addressId, user.userId, result.data);
    return ApiResponse.success(updated, 'Address updated');
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/v1/customers/me/addresses/[addressId] — Delete address
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ addressId: string }> }
): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'CUSTOMER');
    const { addressId } = await params;

    await container.customerService.deleteAddress(addressId, user.userId);
    return ApiResponse.noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
