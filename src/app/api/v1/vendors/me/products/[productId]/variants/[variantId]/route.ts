import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/app-error';
import { requireRole } from '@/lib/auth/permissions';
import { updateVariantSchema } from '@/modules/inventory';

type RouteParams = { params: Promise<{ productId: string; variantId: string }> };

// Get a single variant with its current inventory snapshot
export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'VENDOR');
    const vendorProfile = await container.vendorService.getProfile(user.userId);
    const { productId, variantId } = await params;

    const variant = await container.inventoryService.getVariant(variantId, productId, vendorProfile.id);
    return ApiResponse.success(variant, 'Variant retrieved');
  } catch (error) {
    return handleApiError(error);
  }
}

// Update SKU, price, status, or low-stock threshold for a variant
export async function PUT(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'VENDOR');
    const vendorProfile = await container.vendorService.getProfile(user.userId);
    const { productId, variantId } = await params;

    const body = await request.json();
    const result = updateVariantSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const updated = await container.inventoryService.updateVariant(variantId, productId, vendorProfile.id, result.data);
    return ApiResponse.success(updated, 'Variant updated');
  } catch (error) {
    return handleApiError(error);
  }
}

// Permanently remove a variant and its inventory/movement records
export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'VENDOR');
    const vendorProfile = await container.vendorService.getProfile(user.userId);
    const { productId, variantId } = await params;

    await container.inventoryService.deleteVariant(variantId, productId, vendorProfile.id);
    return ApiResponse.noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
