import { NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { prisma } from '@/lib/db/prisma';
import { env } from '@/config/env';

export async function GET(): Promise<NextResponse> {
  try {
    let dbStatus = 'disconnected';
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch {
      dbStatus = 'unreachable (verify DATABASE_URL)';
    }

    const healthData = {
      status: 'healthy',
      stage: 'Stage 3 — Identity, Authentication & Roles',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      database: dbStatus,
    };

    return ApiResponse.success(healthData, 'System operational health check passed');
  } catch (error) {
    return handleApiError(error);
  }
}
