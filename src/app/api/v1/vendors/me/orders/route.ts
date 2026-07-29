import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { requireRole } from '@/lib/auth/permissions';
import { vendorOrderQuerySchema } from '@/modules/vendor-order';

// GET /api/v1/vendors/me/orders — List all orders assigned to the logged-in vendor
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'VENDOR');

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status') || undefined;

    const queryResult = vendorOrderQuerySchema.safeParse({ status: statusParam });
    const query = queryResult.success ? queryResult.data : undefined;

    const orders = await container.vendorOrderService.listOrders(user.userId, query);
    return ApiResponse.success(orders, 'Vendor orders retrieved');
  } catch (error) {
    return handleApiError(error);
  }
}
