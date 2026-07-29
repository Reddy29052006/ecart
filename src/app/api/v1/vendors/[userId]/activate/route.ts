import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { requireAdmin } from '@/lib/auth/permissions';

// POST /api/v1/vendors/[userId]/activate
// Administrative endpoint — activates a vendor account
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
): Promise<NextResponse> {
  try {
    await requireAdmin(request);
    const { userId } = await params;
    const profile = await container.vendorService.updateStatus(userId, 'ACTIVE');
    return ApiResponse.success(profile, 'Vendor status updated to ACTIVE');
  } catch (error) {
    return handleApiError(error);
  }
}
