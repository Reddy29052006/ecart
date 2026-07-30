import type { OrderStatus, VendorOrderStatus } from '@prisma/client';

// Master Order State Transitions Map
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PARTIALLY_FULFILLED', 'FULFILLED', 'CANCELLED'],
  PARTIALLY_FULFILLED: ['FULFILLED', 'CANCELLED'],
  FULFILLED: [],
  CANCELLED: [],
};

// Vendor Order State Transitions Map
export const VENDOR_ORDER_STATUS_TRANSITIONS: Record<VendorOrderStatus, VendorOrderStatus[]> = {
  NEW: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['READY', 'CANCELLED'],
  READY: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
};

export function canTransitionOrderStatus(current: OrderStatus, next: OrderStatus): boolean {
  if (current === next) return true;
  const allowed = ORDER_STATUS_TRANSITIONS[current] || [];
  return allowed.includes(next);
}

export function canTransitionVendorOrderStatus(current: VendorOrderStatus, next: VendorOrderStatus): boolean {
  if (current === next) return true;
  const allowed = VENDOR_ORDER_STATUS_TRANSITIONS[current] || [];
  return allowed.includes(next);
}

// User-friendly titles for order timeline UI displays
export const ORDER_STATUS_TITLES: Record<OrderStatus, string> = {
  PENDING: 'Order Placed',
  CONFIRMED: 'Order Confirmed',
  PARTIALLY_FULFILLED: 'Partially Fulfilled',
  FULFILLED: 'Order Fulfilled',
  CANCELLED: 'Order Cancelled',
};

export const VENDOR_ORDER_STATUS_TITLES: Record<VendorOrderStatus, string> = {
  NEW: 'New Order Received',
  ACCEPTED: 'Vendor Accepted Order',
  PROCESSING: 'Items in Processing',
  READY: 'Ready for Shipment',
  SHIPPED: 'Order Shipped',
  COMPLETED: 'Order Completed',
  REJECTED: 'Order Rejected by Vendor',
  CANCELLED: 'Order Cancelled',
};
