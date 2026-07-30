import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { requireRole } from '@/lib/auth/permissions';

// POST /api/v1/vendors/me/orders/:id/shipped — Mark order as shipped (READY -> SHIPPED)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'VENDOR');
    const { id } = await params;
    const order = await container.vendorOrderService.markShipped(user.userId, id);
    return ApiResponse.success(order, 'Vendor order marked as shipped');
  } catch (error) {
    return handleApiError(error);
  }
}
