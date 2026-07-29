import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { requireRole } from '@/lib/auth/permissions';

type RouteParams = { params: Promise<{ orderId: string }> };

// GET /api/v1/orders/[orderId] — Get full details of a specific order
export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'CUSTOMER');
    const { orderId } = await params;
    const order = await container.orderService.getOrder(user.userId, orderId);
    return ApiResponse.success(order, 'Order retrieved');
  } catch (error) {
    return handleApiError(error);
  }
}
