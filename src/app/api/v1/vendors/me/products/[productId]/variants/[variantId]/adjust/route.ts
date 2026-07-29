import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/app-error';
import { requireRole } from '@/lib/auth/permissions';
import { adjustStockSchema } from '@/modules/inventory';

// Correct stock levels with a positive or negative adjustment (creates an ADJUSTMENT movement record)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; variantId: string }> }
): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'VENDOR');
    const vendorProfile = await container.vendorService.getProfile(user.userId);
    const { productId, variantId } = await params;

    const body = await request.json();
    const result = adjustStockSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const inventory = await container.inventoryService.adjustStock(variantId, productId, vendorProfile.id, result.data);
    return ApiResponse.success(inventory, `Stock adjusted by ${result.data.quantity > 0 ? '+' : ''}${result.data.quantity} units`);
  } catch (error) {
    return handleApiError(error);
  }
}
