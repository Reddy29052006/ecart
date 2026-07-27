import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/app-error';
import { requireAuth, requireRole } from '@/lib/auth/permissions';
import { updateCustomerProfileSchema } from '@/modules/customer/customer.validation';

// Get the current customer's profile details
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'CUSTOMER');
    const profile = await container.customerService.getProfile(user.userId);
    return ApiResponse.success(profile, 'Customer profile retrieved');
  } catch (error) {
    return handleApiError(error);
  }
}

// Update the customer's personal details (name, display name, photo)
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'CUSTOMER');
    const body = await request.json();
    const result = updateCustomerProfileSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const updated = await container.customerService.updateProfile(user.userId, result.data);
    return ApiResponse.success(updated, 'Customer profile updated');
  } catch (error) {
    return handleApiError(error);
  }
}
