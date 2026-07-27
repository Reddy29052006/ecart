import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/app-error';
import { requireAuth, requireRole } from '@/lib/auth/permissions';
import { updateVendorProfileSchema } from '@/modules/vendor/vendor.validation';

// Get the current logged-in vendor's storefront profile
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'VENDOR');
    const profile = await container.vendorService.getProfile(user.userId);
    return ApiResponse.success(profile, 'Vendor profile retrieved');
  } catch (error) {
    return handleApiError(error);
  }
}

// Update vendor business details (store name, description, phone, email, logo)
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'VENDOR');
    const body = await request.json();
    const result = updateVendorProfileSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const updated = await container.vendorService.updateProfile(user.userId, result.data);
    return ApiResponse.success(updated, 'Vendor profile updated');
  } catch (error) {
    return handleApiError(error);
  }
}
