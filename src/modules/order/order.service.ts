import type { IOrderRepository, IOrderService, CreateVendorOrderData } from './order.contracts';
import type { PlaceOrderDto } from './order.dto';
import type { OrderEntity, OrderListItem, OrderItemEntity, VendorOrderEntity } from './order.types';
import type { ICartRepository } from '@/modules/cart';
import type { ICustomerRepository } from '@/modules/customer';
import { PricingService } from '@/modules/pricing';
import { generateOrderNumber } from '@/lib/order/order-number';
import { BadRequestError, NotFoundError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger/logger';

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
    // Group items by vendorId for multi-vendor order splitting
    const vendorMap = new Map<string, { items: any[]; vendorProfile: any }>();

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
        unitPrice: variant.price,          // server-side price only
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

    const rawOrder = await this.orderRepository.createOrder({
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
    });

    logger.info('[Order] Order placed successfully', {
      userId,
      orderNumber,
      totalAmount: masterPricing.grandTotal,
      vendorCount: vendorOrders.length,
    });

    return this.formatOrder(rawOrder);
  }

  async getOrder(userId: string, orderId: string): Promise<OrderEntity> {
    const rawOrder = await this.orderRepository.findOrderById(orderId, userId);
    if (!rawOrder) {
      throw new NotFoundError('Order not found');
    }
    return this.formatOrder(rawOrder);
  }

  async listOrders(userId: string): Promise<OrderListItem[]> {
    const rawOrders = await this.orderRepository.findOrdersByCustomer(userId);
    return rawOrders.map((o: any) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status as any,
      totalAmount: o.totalAmount,
      currency: o.currency,
      itemCount: o._count?.items ?? 0,
      vendorCount: o._count?.vendorOrders ?? 0,
      createdAt: o.createdAt,
    }));
  }

  private formatOrder(raw: any): OrderEntity {
    const vendorOrders: VendorOrderEntity[] = (raw.vendorOrders || []).map((vo: any) => ({
      id: vo.id,
      orderId: vo.orderId,
      vendorId: vo.vendorId,
      vendorBusinessName: vo.vendor?.businessName ?? '',
      status: vo.status,
      subtotal: vo.subtotal,
      shippingAmount: vo.shippingAmount,
      taxAmount: vo.taxAmount,
      totalAmount: vo.totalAmount,
      items: (vo.items || []).map((item: any): OrderItemEntity => ({
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
      status: raw.status,
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
