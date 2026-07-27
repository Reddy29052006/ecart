import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { requireRole } from '@/lib/auth/permissions';

// DELETE /api/v1/vendors/me/products/[productId]/images/[imageId] — Delete image from product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; imageId: string }> }
): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'VENDOR');
    const vendorProfile = await container.vendorService.getProfile(user.userId);
    const { productId, imageId } = await params;

    await container.productService.deleteProductImage(imageId, productId, vendorProfile.id);
    return ApiResponse.noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
