import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/app-error';
import { createCategorySchema } from '@/modules/catalog/category.validation';

// GET /api/v1/categories — Public category listing
export async function GET(): Promise<NextResponse> {
  try {
    const categories = await container.categoryService.getCategories();
    return ApiResponse.success(categories, 'Categories retrieved');
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/v1/categories — Create category
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = createCategorySchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const created = await container.categoryService.createCategory(result.data);
    return ApiResponse.created(created, 'Category created');
  } catch (error) {
    return handleApiError(error);
  }
}
