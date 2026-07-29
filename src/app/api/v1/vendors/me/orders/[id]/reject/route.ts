import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/app-error';
import { requireRole } from '@/lib/auth/permissions';
import { rejectVendorOrderSchema } from '@/modules/vendor-order';

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/v1/vendors/me/orders/[id]/reject — Reject vendor order (NEW -> REJECTED)
export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'VENDOR');
    const { id } = await params;

    const body = await request.json();
    const result = rejectVendorOrderSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const updated = await container.vendorOrderService.rejectOrder(user.userId, id, result.data);
    return ApiResponse.success(updated, 'Vendor order rejected');
  } catch (error) {
    return handleApiError(error);
  }
}
