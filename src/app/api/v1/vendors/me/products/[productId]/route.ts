import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/app-error';
import { requireRole } from '@/lib/auth/permissions';
import { updateProductSchema } from '@/modules/catalog';

// GET /api/v1/vendors/me/products/[productId] — Fetch single vendor product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'VENDOR');
    const vendorProfile = await container.vendorService.getProfile(user.userId);
    const { productId } = await params;

    const product = await container.productService.getProductById(productId, vendorProfile.id);
    return ApiResponse.success(product, 'Product retrieved');
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/v1/vendors/me/products/[productId] — Update vendor product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'VENDOR');
    const vendorProfile = await container.vendorService.getProfile(user.userId);
    const { productId } = await params;

    const body = await request.json();
    const result = updateProductSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const updated = await container.productService.updateProduct(productId, vendorProfile.id, result.data);
    return ApiResponse.success(updated, 'Product updated');
  } catch (error) {
    return handleApiError(error);
  }
}
