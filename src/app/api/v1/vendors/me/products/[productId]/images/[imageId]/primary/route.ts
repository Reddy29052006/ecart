import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { requireRole } from '@/lib/auth/permissions';

// PATCH /api/v1/vendors/me/products/[productId]/images/[imageId]/primary — Set primary display image
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; imageId: string }> }
): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'VENDOR');
    const vendorProfile = await container.vendorService.getProfile(user.userId);
    const { productId, imageId } = await params;

    const updatedImage = await container.productService.setPrimaryProductImage(imageId, productId, vendorProfile.id);
    return ApiResponse.success(updatedImage, 'Primary product image updated');
  } catch (error) {
    return handleApiError(error);
  }
}
