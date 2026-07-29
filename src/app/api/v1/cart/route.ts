import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { requireRole } from '@/lib/auth/permissions';

// GET /api/v1/cart — Fetch active customer's shopping cart
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'CUSTOMER');
    const cart = await container.cartService.getCart(user.userId);
    return ApiResponse.success(cart, 'Cart retrieved');
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/v1/cart — Empty all items in customer's cart
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'CUSTOMER');
    await container.cartService.clearCart(user.userId);
    return ApiResponse.noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
