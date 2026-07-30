import type { AddressSnapshot } from '@/modules/checkout';

export type OrderStatusType =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PARTIALLY_FULFILLED'
  | 'FULFILLED'
  | 'CANCELLED';

export type VendorOrderStatusType =
  | 'NEW'
  | 'ACCEPTED'
  | 'PROCESSING'
  | 'READY'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export interface OrderItemEntity {
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

export interface VendorOrderEntity {
  id: string;
  orderId: string;
  vendorId: string;
  vendorBusinessName: string;
  status: VendorOrderStatusType;
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  items: OrderItemEntity[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderEntity {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatusType;
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  shippingAddressSnapshot: AddressSnapshot;
  vendorOrders: VendorOrderEntity[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatusType;
  totalAmount: number;
  currency: string;
  itemCount: number;
  vendorCount: number;
  createdAt: Date;
}

export interface OrderStatusHistoryEntity {
  id: string;
  orderId: string;
  previousStatus: OrderStatusType | null;
  status: OrderStatusType;
  title: string;
  changedBy: string;
  comment: string | null;
  createdAt: Date;
}

export interface OrderTimelineResponse {
  orderId: string;
  orderNumber: string;
  currentStatus: OrderStatusType;
  currentStatusTitle: string;
  history: OrderStatusHistoryEntity[];
}

