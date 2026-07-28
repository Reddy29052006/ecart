import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { requireRole } from '@/lib/auth/permissions';

// View the full stock movement history for a variant (STOCK_IN, ADJUSTMENT, RESERVED, etc.)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; variantId: string }> }
): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'VENDOR');
    const vendorProfile = await container.vendorService.getProfile(user.userId);
    const { productId, variantId } = await params;

    const movements = await container.inventoryService.getMovements(variantId, productId, vendorProfile.id);
    return ApiResponse.success(movements, 'Movement history retrieved');
  } catch (error) {
    return handleApiError(error);
  }
}
