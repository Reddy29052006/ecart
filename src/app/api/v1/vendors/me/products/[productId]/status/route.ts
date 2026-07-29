import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/app-error';
import { requireRole } from '@/lib/auth/permissions';
import { updateProductStatusSchema } from '@/modules/catalog';

// PATCH /api/v1/vendors/me/products/[productId]/status — Update product lifecycle status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'VENDOR');
    const vendorProfile = await container.vendorService.getProfile(user.userId);
    const { productId } = await params;

    const body = await request.json();
    const result = updateProductStatusSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const updated = await container.productService.updateProductStatus(productId, vendorProfile.id, result.data.status);
    return ApiResponse.success(updated, `Product status updated to ${result.data.status}`);
  } catch (error) {
    return handleApiError(error);
  }
}
