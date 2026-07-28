import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/app-error';
import { requireRole } from '@/lib/auth/permissions';
import { addStockSchema } from '@/modules/inventory/inventory.validation';

// Add incoming stock units to a variant (creates a STOCK_IN movement record)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; variantId: string }> }
): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'VENDOR');
    const vendorProfile = await container.vendorService.getProfile(user.userId);
    const { productId, variantId } = await params;

    const body = await request.json();
    const result = addStockSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const inventory = await container.inventoryService.addStock(variantId, productId, vendorProfile.id, result.data);
    return ApiResponse.success(inventory, `Added ${result.data.quantity} units to stock`);
  } catch (error) {
    return handleApiError(error);
  }
}
