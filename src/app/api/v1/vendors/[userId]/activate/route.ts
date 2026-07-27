import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { env } from '@/config/env';
import { ForbiddenError } from '@/lib/errors/app-error';

// POST /api/v1/vendors/[userId]/activate
// DEV-ONLY mechanism — activates a vendor account until Admin module is built in Stage 16+
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
): Promise<NextResponse> {
  try {
    if (env.NODE_ENV === 'production') {
      throw new ForbiddenError('This endpoint is not available in production');
    }
    const { userId } = await params;
    const profile = await container.vendorService.updateStatus(userId, 'ACTIVE');
    return ApiResponse.success(profile, 'Vendor activated (dev mode)');
  } catch (error) {
    return handleApiError(error);
  }
}
