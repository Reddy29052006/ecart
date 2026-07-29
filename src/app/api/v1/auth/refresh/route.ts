import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/app-error';
import { refreshTokenSchema } from '@/modules/auth';

// POST /api/v1/auth/refresh — Rotate tokens using a valid refresh token
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = refreshTokenSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const tokens = await container.authService.refreshTokens(result.data.refreshToken);
    return ApiResponse.success(tokens, 'Tokens refreshed successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
