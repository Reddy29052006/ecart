import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/app-error';
import { requireRole } from '@/lib/auth/permissions';
import { addToCartSchema } from '@/modules/cart';

// POST /api/v1/cart/items — Add variant to cart (or increment quantity)
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'CUSTOMER');
    const body = await request.json();
    const result = addToCartSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const updatedCart = await container.cartService.addItem(user.userId, result.data);
    return ApiResponse.created(updatedCart, 'Item added to cart');
  } catch (error) {
    return handleApiError(error);
  }
}
