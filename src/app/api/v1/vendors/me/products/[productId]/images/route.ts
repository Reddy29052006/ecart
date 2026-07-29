import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/app-error';
import { requireRole } from '@/lib/auth/permissions';
import { addProductImageSchema } from '@/modules/catalog';

// POST /api/v1/vendors/me/products/[productId]/images — Add image to product gallery
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'VENDOR');
    const vendorProfile = await container.vendorService.getProfile(user.userId);
    const { productId } = await params;

    const body = await request.json();
    const result = addProductImageSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const image = await container.productService.addProductImage(productId, vendorProfile.id, result.data);
    return ApiResponse.created(image, 'Image added to product gallery');
  } catch (error) {
    return handleApiError(error);
  }
}
