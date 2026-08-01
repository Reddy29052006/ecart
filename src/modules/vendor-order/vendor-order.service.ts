import type { IVendorOrderRepository, IVendorOrderService } from './vendor-order.contracts';
import type { VendorOrderDetailEntity, VendorOrderListItem, VendorOrderQueryDto } from './vendor-order.types';
import type { RejectVendorOrderDto } from './vendor-order.dto';
import type { IVendorRepository } from '@/modules/vendor';
import type { VendorOrderStatusType } from '@/modules/order';
import { BadRequestError, NotFoundError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger/logger';
import { VENDOR_ORDER_STATUS_TITLES } from '@/lib/order/state-machine';

interface RawVendorOrderListItem {
  id: string;
  orderId: string;
  order?: { orderNumber?: string };
  status: string;
  totalAmount: number;
  _count?: { items?: number };
  createdAt: Date;
  updatedAt: Date;
}

interface RawVendorOrderItem {
  id: string;
  orderId: string;
  vendorOrderId: string;
  vendorId: string;
  productId: string;
  variantId: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  createdAt: Date;
}

interface RawVendorOrderDetail {
  id: string;
  orderId: string;
  order?: { orderNumber?: string; shippingAddressSnapshot?: import('@/modules/checkout').AddressSnapshot };
  vendorId: string;
  status: string;
  rejectionReason?: string | null;
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  items?: RawVendorOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface RawVendorOrderStatusHistory {
  id: string;
  vendorOrderId: string;
  previousStatus?: string | null;
  status: string;
  changedBy: string;
  comment?: string | null;
  createdAt: Date;
}

export class VendorOrderService implements IVendorOrderService {
  constructor(
    private readonly vendorOrderRepository: IVendorOrderRepository,
    private readonly vendorRepository: IVendorRepository
  ) {}

  private async getVendorProfileId(userId: string): Promise<string> {
    const profile = await this.vendorRepository.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Vendor profile not found');
    }
    return profile.id;
  }

  async listOrders(userId: string, query?: VendorOrderQueryDto): Promise<VendorOrderListItem[]> {
    const vendorProfileId = await this.getVendorProfileId(userId);
    const rawOrders = (await this.vendorOrderRepository.findVendorOrders(
      vendorProfileId,
      query
    )) as RawVendorOrderListItem[];

    return rawOrders.map((o) => ({
      id: o.id,
      orderId: o.orderId,
      orderNumber: o.order?.orderNumber ?? 'UNKNOWN',
      status: o.status as VendorOrderStatusType,
      totalAmount: o.totalAmount,
      itemCount: o._count?.items ?? 0,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    }));
  }

  async getOrderDetails(userId: string, vendorOrderId: string): Promise<VendorOrderDetailEntity> {
    const vendorProfileId = await this.getVendorProfileId(userId);
    const rawOrder = (await this.vendorOrderRepository.findVendorOrderById(
      vendorOrderId,
      vendorProfileId
    )) as RawVendorOrderDetail | null;

    if (!rawOrder) {
      throw new NotFoundError('Vendor order not found');
    }

    return this.formatVendorOrder(rawOrder);
  }

  async acceptOrder(userId: string, vendorOrderId: string): Promise<VendorOrderDetailEntity> {
    return this.transitionStatus(userId, vendorOrderId, ['NEW'], 'ACCEPTED', 'Order accepted by vendor');
  }

  async rejectOrder(
    userId: string,
    vendorOrderId: string,
    dto: RejectVendorOrderDto
  ): Promise<VendorOrderDetailEntity> {
    if (!dto.reason || dto.reason.trim().length === 0) {
      throw new BadRequestError('Rejection reason is required');
    }
    return this.transitionStatus(
      userId,
      vendorOrderId,
      ['NEW'],
      'REJECTED',
      `Order rejected: ${dto.reason}`,
      dto.reason
    );
  }

  async markProcessing(userId: string, vendorOrderId: string): Promise<VendorOrderDetailEntity> {
    return this.transitionStatus(userId, vendorOrderId, ['ACCEPTED'], 'PROCESSING', 'Order marked as processing');
  }

  async markReady(userId: string, vendorOrderId: string): Promise<VendorOrderDetailEntity> {
    return this.transitionStatus(userId, vendorOrderId, ['PROCESSING'], 'READY', 'Order marked as ready to ship');
  }

  async markShipped(userId: string, vendorOrderId: string): Promise<VendorOrderDetailEntity> {
    return this.transitionStatus(userId, vendorOrderId, ['READY'], 'SHIPPED', 'Order marked as shipped');
  }

  async markCompleted(userId: string, vendorOrderId: string): Promise<VendorOrderDetailEntity> {
    return this.transitionStatus(userId, vendorOrderId, ['SHIPPED'], 'COMPLETED', 'Order marked as completed');
  }

  async getVendorOrderTimeline(
    userId: string,
    vendorOrderId: string
  ): Promise<import('./vendor-order.types').VendorOrderTimelineResponse> {
    const vendorProfileId = await this.getVendorProfileId(userId);
    const existing = (await this.vendorOrderRepository.findVendorOrderById(
      vendorOrderId,
      vendorProfileId
    )) as RawVendorOrderDetail | null;

    if (!existing) {
      throw new NotFoundError('Vendor order not found');
    }

    const history = (await this.vendorOrderRepository.findVendorOrderStatusHistory(
      vendorOrderId,
      vendorProfileId
    )) as RawVendorOrderStatusHistory[];

    return {
      vendorOrderId: existing.id,
      orderNumber: existing.order?.orderNumber ?? 'UNKNOWN',
      currentStatus: existing.status as VendorOrderStatusType,
      currentStatusTitle: VENDOR_ORDER_STATUS_TITLES[existing.status as VendorOrderStatusType] ?? existing.status,
      rejectionReason: existing.rejectionReason ?? null,
      history: history.map((h) => ({
        id: h.id,
        vendorOrderId: h.vendorOrderId,
        previousStatus: (h.previousStatus as VendorOrderStatusType) ?? null,
        status: h.status as VendorOrderStatusType,
        title: VENDOR_ORDER_STATUS_TITLES[h.status as VendorOrderStatusType] ?? h.status,
        changedBy: h.changedBy,
        comment: h.comment ?? null,
        createdAt: h.createdAt,
      })),
    };
  }

  private async transitionStatus(
    userId: string,
    vendorOrderId: string,
    allowedCurrentStatuses: VendorOrderStatusType[],
    targetStatus: VendorOrderStatusType,
    logMsg: string,
    reason?: string
  ): Promise<VendorOrderDetailEntity> {
    const vendorProfileId = await this.getVendorProfileId(userId);
    const existing = (await this.vendorOrderRepository.findVendorOrderById(
      vendorOrderId,
      vendorProfileId
    )) as RawVendorOrderDetail | null;

    if (!existing) {
      throw new NotFoundError('Vendor order not found');
    }

    if (!allowedCurrentStatuses.includes(existing.status as VendorOrderStatusType)) {
      throw new BadRequestError(
        `Cannot transition vendor order status from "${existing.status}" to "${targetStatus}". ` +
          `Allowed current status(es): ${allowedCurrentStatuses.join(', ')}`
      );
    }

    const updated = (await this.vendorOrderRepository.updateVendorOrderStatus(
      vendorOrderId,
      targetStatus,
      userId,
      reason,
      logMsg
    )) as RawVendorOrderDetail;

    logger.info(`[VendorOrder] ${logMsg}`, { vendorOrderId, vendorProfileId, targetStatus });

    return this.formatVendorOrder(updated);
  }

  private formatVendorOrder(raw: RawVendorOrderDetail): VendorOrderDetailEntity {
    return {
      id: raw.id,
      orderId: raw.orderId,
      orderNumber: raw.order?.orderNumber ?? 'UNKNOWN',
      vendorId: raw.vendorId,
      status: raw.status as VendorOrderStatusType,
      rejectionReason: raw.rejectionReason ?? null,
      subtotal: raw.subtotal,
      shippingAmount: raw.shippingAmount,
      taxAmount: raw.taxAmount,
      totalAmount: raw.totalAmount,
      shippingAddressSnapshot: raw.order?.shippingAddressSnapshot ?? ({} as import('@/modules/checkout').AddressSnapshot),
      items: (raw.items || []).map((item) => ({
        id: item.id,
        orderId: item.orderId,
        vendorOrderId: item.vendorOrderId,
        vendorId: item.vendorId,
        productId: item.productId,
        variantId: item.variantId,
        productNameSnapshot: item.productNameSnapshot,
        skuSnapshot: item.skuSnapshot,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        createdAt: item.createdAt,
      })),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
