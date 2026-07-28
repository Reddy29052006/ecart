import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { requireRole } from '@/lib/auth/permissions';

// View current stock levels for a variant (available, reserved, sellable)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; variantId: string }> }
): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'VENDOR');
    const vendorProfile = await container.vendorService.getProfile(user.userId);
    const { productId, variantId } = await params;

    const inventory = await container.inventoryService.getInventory(variantId, productId, vendorProfile.id);
    return ApiResponse.success(inventory, 'Inventory retrieved');
  } catch (error) {
    return handleApiError(error);
  }
}
