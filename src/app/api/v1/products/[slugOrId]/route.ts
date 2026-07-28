import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';

// Public endpoint to view detailed product information by ID or URL slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slugOrId: string }> }
): Promise<NextResponse> {
  try {
    const { slugOrId } = await params;
    const product = await container.productService.getPublicProductDetails(slugOrId);
    return ApiResponse.success(product, 'Product details retrieved');
  } catch (error) {
    return handleApiError(error);
  }
}
