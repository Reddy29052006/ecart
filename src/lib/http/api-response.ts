import { NextResponse } from 'next/server';

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  data: T | null;
  message: string;
  errors?: Record<string, string[]> | string[];
}

export class ApiResponse {
  static success<T>(
    data: T,
    message = 'Operation successful',
    status = 200
  ): NextResponse<ApiEnvelope<T>> {
    return NextResponse.json(
      {
        success: true,
        data,
        message,
      },
      { status }
    );
  }

  static error(
    message = 'An error occurred',
    status = 500,
    errors?: Record<string, string[]> | string[]
  ): NextResponse<ApiEnvelope<null>> {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message,
        errors,
      },
      { status }
    );
  }

  static created<T>(
    data: T,
    message = 'Resource created successfully'
  ): NextResponse<ApiEnvelope<T>> {
    return ApiResponse.success(data, message, 201);
  }

  static noContent(): NextResponse<null> {
    return new NextResponse(null, { status: 204 });
  }
}
