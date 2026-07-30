import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { requireRole } from '@/lib/auth/permissions';

// POST /api/v1/vendors/me/orders/:id/completed — Mark order as completed (SHIPPED -> COMPLETED)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'VENDOR');
    const { id } = await params;
    const order = await container.vendorOrderService.markCompleted(user.userId, id);
    return ApiResponse.success(order, 'Vendor order marked as completed');
  } catch (error) {
    return handleApiError(error);
  }
}
