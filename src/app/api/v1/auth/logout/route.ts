import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/app-error';
import { refreshTokenSchema } from '@/modules/auth/auth.validation';

// POST /api/v1/auth/logout — Invalidate refresh token
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = refreshTokenSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    await container.authService.logout(result.data.refreshToken);
    return ApiResponse.success(null, 'Logged out successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
