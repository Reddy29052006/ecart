import type { VendorOrderStatusType } from '@/modules/order';
import type {
  VendorOrderDetailEntity,
  VendorOrderListItem,
  VendorOrderQueryDto,
  VendorOrderTimelineResponse,
} from './vendor-order.types';
import type { RejectVendorOrderDto } from './vendor-order.dto';

export interface IVendorOrderRepository {
  findVendorOrders(vendorProfileId: string, query?: VendorOrderQueryDto): Promise<unknown[]>;
  findVendorOrderById(vendorOrderId: string, vendorProfileId: string): Promise<unknown | null>;
  updateVendorOrderStatus(
    vendorOrderId: string,
    status: VendorOrderStatusType,
    changedBy: string,
    reason?: string,
    comment?: string
  ): Promise<unknown>;
  findVendorOrderStatusHistory(vendorOrderId: string, vendorProfileId: string): Promise<unknown[]>;
}

export interface IVendorOrderService {
  listOrders(userId: string, query?: VendorOrderQueryDto): Promise<VendorOrderListItem[]>;
  getOrderDetails(userId: string, vendorOrderId: string): Promise<VendorOrderDetailEntity>;
  acceptOrder(userId: string, vendorOrderId: string): Promise<VendorOrderDetailEntity>;
  rejectOrder(userId: string, vendorOrderId: string, dto: RejectVendorOrderDto): Promise<VendorOrderDetailEntity>;
  markProcessing(userId: string, vendorOrderId: string): Promise<VendorOrderDetailEntity>;
  markReady(userId: string, vendorOrderId: string): Promise<VendorOrderDetailEntity>;
  markShipped(userId: string, vendorOrderId: string): Promise<VendorOrderDetailEntity>;
  markCompleted(userId: string, vendorOrderId: string): Promise<VendorOrderDetailEntity>;
  getVendorOrderTimeline(userId: string, vendorOrderId: string): Promise<VendorOrderTimelineResponse>;
}
