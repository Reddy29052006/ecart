import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/app-error';
import { requireRole } from '@/lib/auth/permissions';
import { checkoutPreviewSchema } from '@/modules/checkout';

// POST /api/v1/cart/checkout/preview — Validate cart and return full order preview
// This is read-only — no records are created until the customer confirms the order
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'CUSTOMER');
    const body = await request.json();
    const result = checkoutPreviewSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const preview = await container.checkoutService.previewOrder(user.userId, result.data);
    return ApiResponse.success(preview, 'Order preview generated');
  } catch (error) {
    return handleApiError(error);
  }
}
