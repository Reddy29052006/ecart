import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/app-error';
import { requireRole } from '@/lib/auth/permissions';
import { updateCartItemSchema } from '@/modules/cart';

type RouteParams = { params: Promise<{ itemId: string }> };

// PUT /api/v1/cart/items/[itemId] — Update item quantity (0 removes item)
export async function PUT(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'CUSTOMER');
    const { itemId } = await params;
    const body = await request.json();
    const result = updateCartItemSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const updatedCart = await container.cartService.updateItemQuantity(user.userId, itemId, result.data);
    return ApiResponse.success(updatedCart, 'Cart item updated');
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/v1/cart/items/[itemId] — Remove item from cart
export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'CUSTOMER');
    const { itemId } = await params;

    const updatedCart = await container.cartService.removeItem(user.userId, itemId);
    return ApiResponse.success(updatedCart, 'Item removed from cart');
  } catch (error) {
    return handleApiError(error);
  }
}
