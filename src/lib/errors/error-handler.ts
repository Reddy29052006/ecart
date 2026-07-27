import { NextResponse } from 'next/server';
import { AppError } from './app-error';
import { ApiResponse } from '@/lib/http/api-response';
import { logger } from '@/lib/logger/logger';

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    logger.warn(`[AppError ${error.statusCode}] ${error.message}`, {
      errors: error.errors,
      stack: error.stack,
    });
    return ApiResponse.error(error.message, error.statusCode, error.errors);
  }

  if (error instanceof Error) {
    logger.error(`[UnhandledError] ${error.message}`, {
      stack: error.stack,
    });
    return ApiResponse.error('An unexpected server error occurred', 500);
  }

  logger.error('[UnknownError]', { error });
  return ApiResponse.error('An unknown server error occurred', 500);
}
