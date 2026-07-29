import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/app-error';
import { productQuerySchema } from '@/modules/catalog';

// Public endpoint to search, filter, sort, and paginate active store products
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());

    const result = productQuerySchema.safeParse(rawParams);
    if (!result.success) {
      throw new ValidationError('Invalid catalog query parameters', result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const paginatedProducts = await container.productService.getPublicProducts(result.data);
    return ApiResponse.success(paginatedProducts, 'Public products retrieved');
  } catch (error) {
    return handleApiError(error);
  }
}
