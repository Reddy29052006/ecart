import type { IOrderRepository, IOrderService, CreateVendorOrderData, CreateOrderItemData } from './order.contracts';
import type { PlaceOrderDto } from './order.dto';
import type { OrderEntity, OrderListItem, OrderItemEntity, VendorOrderEntity, OrderStatusType } from './order.types';
import type { ICartRepository } from '@/modules/cart';
import type { ICustomerRepository } from '@/modules/customer';
import { PricingService } from '@/modules/pricing';
import { generateOrderNumber } from '@/lib/order/order-number';
import { BadRequestError, NotFoundError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger/logger';
import { ORDER_STATUS_TITLES } from '@/lib/order/state-machine';

interface RawOrderListItem {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  currency: string;
  _count?: { items?: number; vendorOrders?: number };
  createdAt: Date;
}

interface RawOrderItem {
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

interface RawVendorOrder {
  id: string;
  orderId: string;
  vendorId: string;
  vendor?: { businessName?: string };
  status: string;
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  items?: RawOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface RawOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  status: string;
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  shippingAddressSnapshot: import('./order.types').AddressSnapshot;
  vendorOrders?: RawVendorOrder[];
  createdAt: Date;
  updatedAt: Date;
}

interface RawOrderStatusHistory {
  id: string;
  orderId: string;
  previousStatus?: string | null;
  status: string;
  changedBy: string;
  comment?: string | null;
  createdAt: Date;
}

export class OrderService implements IOrderService {
  private readonly pricingService: PricingService;

  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly cartRepository: ICartRepository,
    private readonly customerRepository: ICustomerRepository
  ) {
    this.pricingService = new PricingService();
  }

  async placeOrder(userId: string, dto: PlaceOrderDto): Promise<OrderEntity> {
    // Gate 1: Customer profile
    let profile = await this.customerRepository.findProfileByUserId(userId);
    if (!profile) {
      profile = await this.customerRepository.upsertProfile(userId, {});
    }

    // Gate 2: Delivery address belongs to this customer
    const address = await this.customerRepository.findAddressById(dto.addressId, userId);
    if (!address) {
      throw new NotFoundError('Delivery address not found');
    }

    // Gate 3: Cart must not be empty
    const rawCart = await this.cartRepository.findCartByCustomerId(profile.id);
    if (!rawCart || !rawCart.items || rawCart.items.length === 0) {
      throw new BadRequestError('Your cart is empty');
    }

    // Gates 4–8: Validate every item and build vendor-grouped data
    const vendorMap = new Map<string, { items: CreateOrderItemData[]; vendorProfile: { id: string } }>();

    for (const cartItem of rawCart.items) {
      const variant = cartItem.variant;
      const product = variant?.product;
      const vendor = product?.vendor;
      const inventory = variant?.inventory;

      if (!product || product.status !== 'ACTIVE') {
        throw new BadRequestError(`Product "${product?.name ?? 'unknown'}" is no longer available`);
      }
      if (!variant || variant.status !== 'ACTIVE') {
        throw new BadRequestError(`A variant of "${product.name}" is currently inactive`);
      }
      if (!vendor || vendor.status !== 'ACTIVE') {
        throw new BadRequestError(`The vendor selling "${product.name}" is currently unavailable`);
      }

      const availableQty = inventory?.availableQuantity ?? 0;
      const reservedQty = inventory?.reservedQuantity ?? 0;
      const sellableQty = Math.max(0, availableQty - reservedQty);

      if (sellableQty < cartItem.quantity) {
        throw new BadRequestError(
          `Insufficient stock for "${product.name}" (${variant.sku}). ` +
          `Requested: ${cartItem.quantity}, Available: ${sellableQty}`
        );
      }

      if (!vendorMap.has(vendor.id)) {
        vendorMap.set(vendor.id, { items: [], vendorProfile: vendor });
      }
      vendorMap.get(vendor.id)!.items.push({
        variantId: variant.id,
        productId: product.id,
        vendorId: vendor.id,
        productNameSnapshot: product.name,
        skuSnapshot: variant.sku,
        unitPrice: variant.price,
        quantity: cartItem.quantity,
        totalPrice: parseFloat((variant.price * cartItem.quantity).toFixed(2)),
      });
    }

    // Build vendor sub-orders with per-vendor pricing
    const vendorOrders: CreateVendorOrderData[] = [];
    for (const [, { items }] of vendorMap) {
      const vendorPricing = this.pricingService.calculate(items.map((i) => ({
        variantId: i.variantId,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
      })));
      vendorOrders.push({
        vendorId: items[0].vendorId,
        subtotal: vendorPricing.subtotal,
        shippingAmount: vendorPricing.shippingAmount,
        taxAmount: vendorPricing.taxAmount,
        totalAmount: vendorPricing.grandTotal,
        items,
      });
    }

    // Calculate master order total across all vendors
    const allItems = vendorOrders.flatMap((vo) => vo.items.map((i) => ({
      variantId: i.variantId,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
    })));
    const masterPricing = this.pricingService.calculate(allItems);

    // Build address snapshot
    const shippingAddressSnapshot = {
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? null,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    };

    const orderNumber = generateOrderNumber();

    const rawOrder = (await this.orderRepository.createOrder({
      customerId: userId,
      orderNumber,
      subtotal: masterPricing.subtotal,
      shippingAmount: masterPricing.shippingAmount,
      taxAmount: masterPricing.taxAmount,
      discountAmount: masterPricing.discountAmount,
      totalAmount: masterPricing.grandTotal,
      currency: masterPricing.currency,
      shippingAddressSnapshot,
      vendorOrders,
    })) as RawOrder;

    logger.info('[Order] Order placed successfully', {
      userId,
      orderNumber,
      totalAmount: masterPricing.grandTotal,
      vendorCount: vendorOrders.length,
    });

    return this.formatOrder(rawOrder);
  }

  async getOrder(userId: string, orderId: string): Promise<OrderEntity> {
    const rawOrder = (await this.orderRepository.findOrderById(orderId, userId)) as RawOrder | null;
    if (!rawOrder) {
      throw new NotFoundError('Order not found');
    }
    return this.formatOrder(rawOrder);
  }

  async getOrderTimeline(userId: string, orderId: string): Promise<import('./order.types').OrderTimelineResponse> {
    const rawOrder = (await this.orderRepository.findOrderById(orderId, userId)) as RawOrder | null;
    if (!rawOrder) {
      throw new NotFoundError('Order not found');
    }

    const history = (await this.orderRepository.findOrderStatusHistory(
      orderId,
      userId
    )) as RawOrderStatusHistory[];

    return {
      orderId: rawOrder.id,
      orderNumber: rawOrder.orderNumber,
      currentStatus: rawOrder.status as OrderStatusType,
      currentStatusTitle: ORDER_STATUS_TITLES[rawOrder.status as OrderStatusType] ?? rawOrder.status,
      history: history.map((h) => ({
        id: h.id,
        orderId: h.orderId,
        previousStatus: (h.previousStatus as OrderStatusType) ?? null,
        status: h.status as OrderStatusType,
        title: ORDER_STATUS_TITLES[h.status as OrderStatusType] ?? h.status,
        changedBy: h.changedBy,
        comment: h.comment ?? null,
        createdAt: h.createdAt,
      })),
    };
  }

  async listOrders(userId: string): Promise<OrderListItem[]> {
    const rawOrders = (await this.orderRepository.findOrdersByCustomer(userId)) as RawOrderListItem[];
    return rawOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status as OrderStatusType,
      totalAmount: o.totalAmount,
      currency: o.currency,
      itemCount: o._count?.items ?? 0,
      vendorCount: o._count?.vendorOrders ?? 0,
      createdAt: o.createdAt,
    }));
  }

  private formatOrder(raw: RawOrder): OrderEntity {
    const vendorOrders: VendorOrderEntity[] = (raw.vendorOrders || []).map((vo) => ({
      id: vo.id,
      orderId: vo.orderId,
      vendorId: vo.vendorId,
      vendorBusinessName: vo.vendor?.businessName ?? '',
      status: vo.status as import('@/modules/order').VendorOrderStatusType,
      subtotal: vo.subtotal,
      shippingAmount: vo.shippingAmount,
      taxAmount: vo.taxAmount,
      totalAmount: vo.totalAmount,
      items: (vo.items || []).map((item): OrderItemEntity => ({
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
      createdAt: vo.createdAt,
      updatedAt: vo.updatedAt,
    }));

    return {
      id: raw.id,
      orderNumber: raw.orderNumber,
      customerId: raw.customerId,
      status: raw.status as OrderStatusType,
      subtotal: raw.subtotal,
      shippingAmount: raw.shippingAmount,
      taxAmount: raw.taxAmount,
      discountAmount: raw.discountAmount,
      totalAmount: raw.totalAmount,
      currency: raw.currency,
      shippingAddressSnapshot: raw.shippingAddressSnapshot,
      vendorOrders,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
