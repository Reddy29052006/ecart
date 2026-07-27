import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/app-error';
import { loginSchema } from '@/modules/auth/auth.validation';

// POST /api/v1/auth/login — Login for both Customer and Vendor
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const response = await container.authService.login(result.data);
    return ApiResponse.success(response, 'Login successful');
  } catch (error) {
    return handleApiError(error);
  }
}
