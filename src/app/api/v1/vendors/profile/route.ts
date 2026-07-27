import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/app-error';
import { requireRole } from '@/lib/auth/permissions';
import { updateVendorProfileSchema } from '@/modules/vendor/vendor.validation';

// GET /api/v1/vendors/profile
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'VENDOR');
    const profile = await container.vendorService.getProfile(user.userId);
    return ApiResponse.success(profile, 'Vendor profile retrieved');
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/v1/vendors/profile — creates or updates the vendor profile
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'VENDOR');
    const body = await request.json();
    const result = updateVendorProfileSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten().fieldErrors as Record<string, string[]>);
    }
    const profile = await container.vendorService.updateProfile(user.userId, result.data);
    return ApiResponse.success(profile, 'Vendor profile saved');
  } catch (error) {
    return handleApiError(error);
  }
}
