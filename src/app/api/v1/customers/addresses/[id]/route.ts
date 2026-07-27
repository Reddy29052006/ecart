import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/app-error';
import { requireRole } from '@/lib/auth/permissions';
import { updateAddressSchema } from '@/modules/customer/customer.validation';

// PUT /api/v1/customers/addresses/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'CUSTOMER');
    const { id } = await params;
    const body = await request.json();
    const result = updateAddressSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten().fieldErrors as Record<string, string[]>);
    }
    const address = await container.customerService.updateAddress(user.userId, id, result.data);
    return ApiResponse.success(address, 'Address updated');
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/v1/customers/addresses/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'CUSTOMER');
    const { id } = await params;
    await container.customerService.deleteAddress(user.userId, id);
    return ApiResponse.success(null, 'Address deleted');
  } catch (error) {
    return handleApiError(error);
  }
}
