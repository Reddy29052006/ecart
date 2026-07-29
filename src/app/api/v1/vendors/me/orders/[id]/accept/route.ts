import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { requireRole } from '@/lib/auth/permissions';

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/v1/vendors/me/orders/[id]/accept — Accept vendor order (NEW -> ACCEPTED)
export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'VENDOR');
    const { id } = await params;

    const updated = await container.vendorOrderService.acceptOrder(user.userId, id);
    return ApiResponse.success(updated, 'Vendor order accepted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
