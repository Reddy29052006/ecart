import type { VendorOrderStatusType } from '@/modules/order';
import type {
  VendorOrderDetailEntity,
  VendorOrderListItem,
  VendorOrderQueryDto,
  VendorOrderTimelineResponse,
} from './vendor-order.types';
import type { RejectVendorOrderDto } from './vendor-order.dto';

export interface IVendorOrderRepository {
  findVendorOrders(vendorProfileId: string, query?: VendorOrderQueryDto): Promise<any[]>;
  findVendorOrderById(vendorOrderId: string, vendorProfileId: string): Promise<any | null>;
  updateVendorOrderStatus(
    vendorOrderId: string,
    status: VendorOrderStatusType,
    changedBy: string,
    reason?: string,
    comment?: string
  ): Promise<any>;
  findVendorOrderStatusHistory(vendorOrderId: string, vendorProfileId: string): Promise<any[]>;
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

