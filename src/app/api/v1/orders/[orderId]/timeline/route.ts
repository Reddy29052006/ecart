import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { requireRole } from '@/lib/auth/permissions';

// GET /api/v1/orders/:orderId/timeline — Retrieve status history timeline for an order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'CUSTOMER');
    const { orderId } = await params;
    const timeline = await container.orderService.getOrderTimeline(user.userId, orderId);
    return ApiResponse.success(timeline, 'Order status timeline retrieved');
  } catch (error) {
    return handleApiError(error);
  }
}
