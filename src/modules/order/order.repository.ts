import type { PrismaClient } from '@prisma/client';
import type { IOrderRepository, CreateOrderData } from './order.contracts';

export class OrderRepository implements IOrderRepository {
  constructor(private readonly db: PrismaClient) { }

  private readonly orderInclude = {
    vendorOrders: {
      include: {
        vendor: {
          select: { id: true, businessName: true, status: true },
        },
        items: true,
      },
      orderBy: { createdAt: 'asc' as const },
    },
  };

  // Create a complete order with all vendor sub-orders and line items in a single atomic transaction
  async createOrder(data: CreateOrderData): Promise<any> {
    return this.db.$transaction(async (tx) => {
      // 1. Create the master order record
      const order = await tx.order.create({
        data: {
          orderNumber: data.orderNumber,
          customerId: data.customerId,
          subtotal: data.subtotal,
          shippingAmount: data.shippingAmount,
          taxAmount: data.taxAmount,
          discountAmount: data.discountAmount,
          totalAmount: data.totalAmount,
          currency: data.currency,
          shippingAddressSnapshot: data.shippingAddressSnapshot,
        },
      });

      // 1b. Create initial status history entry for master order
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: null,
          status: 'PENDING',
          changedBy: data.customerId,
          comment: 'Order placed by customer',
        },
      });

      // 2. For each vendor group, create a VendorOrder then its OrderItems
      for (const vendorOrderData of data.vendorOrders) {
        const vendorOrder = await tx.vendorOrder.create({
          data: {
            orderId: order.id,
            vendorId: vendorOrderData.vendorId,
            subtotal: vendorOrderData.subtotal,
            shippingAmount: vendorOrderData.shippingAmount,
            taxAmount: vendorOrderData.taxAmount,
            totalAmount: vendorOrderData.totalAmount,
          },
        });

        // 2b. Create initial status history entry for vendor order
        await tx.vendorOrderStatusHistory.create({
          data: {
            vendorOrderId: vendorOrder.id,
            previousStatus: null,
            status: 'NEW',
            changedBy: data.customerId,
            comment: 'Sub-order created for vendor',
          },
        });

        // 3. Create all line items for this vendor's sub-order
        await tx.orderItem.createMany({
          data: vendorOrderData.items.map((item) => ({
            orderId: order.id,
            vendorOrderId: vendorOrder.id,
            vendorId: item.vendorId,
            productId: item.productId,
            variantId: item.variantId,
            productNameSnapshot: item.productNameSnapshot,
            skuSnapshot: item.skuSnapshot,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
          })),
        });

        // 4. Reserve inventory for each item in this vendor's sub-order
        for (const item of vendorOrderData.items) {
          await tx.inventory.update({
            where: { variantId: item.variantId },
            data: { reservedQuantity: { increment: item.quantity } },
          });

          // Create RESERVED movement record for audit trail
          await tx.inventoryMovement.create({
            data: {
              variantId: item.variantId,
              type: 'RESERVED',
              quantity: item.quantity,
              referenceType: 'ORDER',
              referenceId: order.id,
              note: `Reserved for order ${data.orderNumber}`,
            },
          });
        }
      }

      // 5. Clear the cart after successful order creation
      // (find the CustomerProfile first to get cart)
      const customerProfile = await tx.customerProfile.findUnique({
        where: { userId: data.customerId },
        include: { cart: true },
      });

      if (customerProfile?.cart) {
        await tx.cartItem.deleteMany({
          where: { cartId: customerProfile.cart.id },
        });
      }

      // 6. Return the fully populated order
      return tx.order.findUnique({
        where: { id: order.id },
        include: this.orderInclude,
      });
    });
  }

  async findOrderById(orderId: string, customerId: string): Promise<any | null> {
    return this.db.order.findFirst({
      where: { id: orderId, customerId },
      include: this.orderInclude,
    });
  }

  async findOrdersByCustomer(customerId: string): Promise<any[]> {
    return this.db.order.findMany({
      where: { customerId },
      include: {
        _count: { select: { items: true, vendorOrders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOrderStatusHistory(orderId: string, customerId: string): Promise<any[]> {
    const order = await this.db.order.findFirst({
      where: { id: orderId, customerId },
      select: { id: true },
    });

    if (!order) return [];

    return this.db.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
