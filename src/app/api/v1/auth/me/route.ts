import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { requireAuth } from '@/lib/auth/permissions';

// GET /api/v1/auth/me — Returns the current authenticated user
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const currentUser = await requireAuth(request);
    const user = await container.authRepository.findUserById(currentUser.userId);
    return ApiResponse.success(
      {
        id: user?.id,
        email: user?.email,
        phone: user?.phone,
        activeRole: currentUser.role,
        roles: user?.roles,
        status: user?.status,
        emailVerified: user?.emailVerified,
      },
      'Authenticated user retrieved'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
