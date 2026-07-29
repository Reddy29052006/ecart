import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/app-error';
import { requireRole } from '@/lib/auth/permissions';
import { createProductSchema } from '@/modules/catalog';

// Fetch all products created by the currently logged-in vendor
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'VENDOR');
    const vendorProfile = await container.vendorService.getProfile(user.userId);

    const products = await container.productService.getVendorProducts(vendorProfile.id);
    return ApiResponse.success(products, 'Vendor products retrieved');
  } catch (error) {
    return handleApiError(error);
  }
}

// Add a new product to the vendor's catalog
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'VENDOR');
    const vendorProfile = await container.vendorService.getProfile(user.userId);

    const body = await request.json();
    const result = createProductSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const created = await container.productService.createProduct(vendorProfile.id, result.data);
    return ApiResponse.created(created, 'Product created successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
