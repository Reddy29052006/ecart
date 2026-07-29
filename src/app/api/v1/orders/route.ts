import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/composition-root';
import { ApiResponse } from '@/lib/http/api-response';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/app-error';
import { requireRole } from '@/lib/auth/permissions';
import { placeOrderSchema } from '@/modules/order';

// POST /api/v1/orders — Place a new order from current cart
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'CUSTOMER');
    const body = await request.json();
    const result = placeOrderSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const order = await container.orderService.placeOrder(user.userId, result.data);
    return ApiResponse.created(order, `Order ${order.orderNumber} placed successfully`);
  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/v1/orders — List all orders for the authenticated customer
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireRole(request, 'CUSTOMER');
    const orders = await container.orderService.listOrders(user.userId);
    return ApiResponse.success(orders, 'Orders retrieved');
  } catch (error) {
    return handleApiError(error);
  }
}
