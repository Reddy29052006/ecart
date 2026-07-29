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
