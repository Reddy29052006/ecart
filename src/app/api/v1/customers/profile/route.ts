import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/app-error';
import { requireRole } from '@/lib/auth/permissions';
import { updateCustomerProfileSchema } from '@/modules/customer/customer.validation';

// GET /api/v1/customers/profile
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'CUSTOMER');
    const profile = await container.customerService.getProfile(user.userId);
    return ApiResponse.success(profile, 'Profile retrieved');
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/v1/customers/profile
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'CUSTOMER');
    const body = await request.json();
    const result = updateCustomerProfileSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten().fieldErrors as Record<string, string[]>);
    }
    const profile = await container.customerService.updateProfile(user.userId, result.data);
    return ApiResponse.success(profile, 'Profile updated');
  } catch (error) {
    return handleApiError(error);
  }
}
