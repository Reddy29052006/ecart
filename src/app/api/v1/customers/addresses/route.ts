import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/app-error';
import { requireRole } from '@/lib/auth/permissions';
import { createAddressSchema } from '@/modules/customer';

// GET /api/v1/customers/addresses
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'CUSTOMER');
    const addresses = await container.customerService.getAddresses(user.userId);
    return ApiResponse.success(addresses, 'Addresses retrieved');
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/v1/customers/addresses
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'CUSTOMER');
    const body = await request.json();
    const result = createAddressSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten().fieldErrors as Record<string, string[]>);
    }
    const address = await container.customerService.createAddress(user.userId, result.data);
    return ApiResponse.created(address, 'Address added');
  } catch (error) {
    return handleApiError(error);
  }
}
