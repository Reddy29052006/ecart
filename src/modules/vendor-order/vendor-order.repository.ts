import type { PrismaClient, VendorOrderStatus } from '@prisma/client';
import type { IVendorOrderRepository } from './vendor-order.contracts';
import type { VendorOrderQueryDto } from './vendor-order.types';
import type { VendorOrderStatusType } from '@/modules/order';

export class VendorOrderRepository implements IVendorOrderRepository {
  constructor(private readonly db: PrismaClient) {}

  private readonly vendorOrderInclude = {
    order: {
      select: {
        orderNumber: true,
        shippingAddressSnapshot: true,
      },
    },
    items: true,
  };

  async findVendorOrders(vendorProfileId: string, query?: VendorOrderQueryDto): Promise<any[]> {
    const where: any = { vendorId: vendorProfileId };
    if (query?.status) {
      where.status = query.status as VendorOrderStatus;
    }

    return this.db.vendorOrder.findMany({
      where,
      include: {
        order: { select: { orderNumber: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findVendorOrderById(vendorOrderId: string, vendorProfileId: string): Promise<any | null> {
    return this.db.vendorOrder.findFirst({
      where: {
        id: vendorOrderId,
        vendorId: vendorProfileId,
      },
      include: this.vendorOrderInclude,
    });
  }

  async updateVendorOrderStatus(
    vendorOrderId: string,
    status: VendorOrderStatusType,
    reason?: string
  ): Promise<any> {
    return this.db.$transaction(async (tx) => {
      // 1. Update this vendor sub-order
      const updatedVendorOrder = await tx.vendorOrder.update({
        where: { id: vendorOrderId },
        data: {
          status: status as VendorOrderStatus,
          ...(reason ? { rejectionReason: reason } : {}),
        },
        include: this.vendorOrderInclude,
      });

      // 2. Sync parent master Order status based on all vendor sub-orders
      const parentOrderId = updatedVendorOrder.orderId;
      const allVendorOrders = await tx.vendorOrder.findMany({
        where: { orderId: parentOrderId },
      });

      const statuses = allVendorOrders.map((vo) => vo.status);
      let newParentStatus: 'PENDING' | 'CONFIRMED' | 'PARTIALLY_FULFILLED' | 'FULFILLED' | 'CANCELLED' = 'PENDING';

      const allCompleted = statuses.every((s) => s === 'COMPLETED');
      const allRejectedOrCancelled = statuses.every((s) => s === 'REJECTED' || s === 'CANCELLED');
      const anyCompleted = statuses.some((s) => s === 'COMPLETED' || s === 'SHIPPED');
      const allAcceptedOrBeyond = statuses.every(
        (s) => s === 'ACCEPTED' || s === 'PROCESSING' || s === 'READY' || s === 'SHIPPED' || s === 'COMPLETED'
      );

      if (allCompleted) {
        newParentStatus = 'FULFILLED';
      } else if (allRejectedOrCancelled) {
        newParentStatus = 'CANCELLED';
      } else if (anyCompleted) {
        newParentStatus = 'PARTIALLY_FULFILLED';
      } else if (allAcceptedOrBeyond) {
        newParentStatus = 'CONFIRMED';
      }

      await tx.order.update({
        where: { id: parentOrderId },
        data: { status: newParentStatus },
      });

      return updatedVendorOrder;
    });
  }
}
