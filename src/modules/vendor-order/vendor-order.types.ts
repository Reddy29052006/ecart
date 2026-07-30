import type { VendorOrderStatusType, OrderItemEntity } from '@/modules/order';
import type { AddressSnapshot } from '@/modules/checkout';

export interface VendorOrderDetailEntity {
  id: string;
  orderId: string;
  orderNumber: string;
  vendorId: string;
  status: VendorOrderStatusType;
  rejectionReason: string | null;
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  shippingAddressSnapshot: AddressSnapshot;
  items: OrderItemEntity[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorOrderListItem {
  id: string;
  orderId: string;
  orderNumber: string;
  status: VendorOrderStatusType;
  totalAmount: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorOrderQueryDto {
  status?: VendorOrderStatusType;
}

export interface VendorOrderStatusHistoryEntity {
  id: string;
  vendorOrderId: string;
  previousStatus: VendorOrderStatusType | null;
  status: VendorOrderStatusType;
  title: string;
  changedBy: string;
  comment: string | null;
  createdAt: Date;
}

export interface VendorOrderTimelineResponse {
  vendorOrderId: string;
  orderNumber: string;
  currentStatus: VendorOrderStatusType;
  currentStatusTitle: string;
  rejectionReason: string | null;
  history: VendorOrderStatusHistoryEntity[];
}

