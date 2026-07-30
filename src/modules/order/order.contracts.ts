import type { OrderEntity, OrderListItem, OrderTimelineResponse } from './order.types';
import type { PlaceOrderDto } from './order.dto';

export interface IOrderRepository {
  createOrder(data: CreateOrderData): Promise<any>;
  findOrderById(orderId: string, customerId: string): Promise<any | null>;
  findOrdersByCustomer(customerId: string): Promise<any[]>;
  findOrderStatusHistory(orderId: string, customerId: string): Promise<any[]>;
}

export interface IOrderService {
  placeOrder(userId: string, dto: PlaceOrderDto): Promise<OrderEntity>;
  getOrder(userId: string, orderId: string): Promise<OrderEntity>;
  listOrders(userId: string): Promise<OrderListItem[]>;
  getOrderTimeline(userId: string, orderId: string): Promise<OrderTimelineResponse>;
}

// Internal data structure passed from OrderService → OrderRepository
export interface CreateOrderItemData {
  vendorId: string;
  productId: string;
  variantId: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface CreateVendorOrderData {
  vendorId: string;
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  items: CreateOrderItemData[];
}

export interface CreateOrderData {
  customerId: string;
  orderNumber: string;
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  shippingAddressSnapshot: object;
  vendorOrders: CreateVendorOrderData[];
}
