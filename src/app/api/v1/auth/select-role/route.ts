import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/app-error';
import { selectRoleSchema } from '@/modules/auth';

// POST /api/v1/auth/select-role — Phase 2 Role Selection for dual-role users
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = selectRoleSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const response = await container.authService.selectRole(result.data);
    return ApiResponse.success(response, 'Role selected successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
