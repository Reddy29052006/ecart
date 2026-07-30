import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { requireRole } from '@/lib/auth/permissions';

// GET /api/v1/vendors/me/orders/:id/timeline — Retrieve status history timeline for a vendor sub-order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'VENDOR');
    const { id } = await params;
    const timeline = await container.vendorOrderService.getVendorOrderTimeline(user.userId, id);
    return ApiResponse.success(timeline, 'Vendor order timeline retrieved');
  } catch (error) {
    return handleApiError(error);
  }
}
