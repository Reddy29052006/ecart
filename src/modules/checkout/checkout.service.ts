import type { ICheckoutService } from './checkout.contracts';
import type { CheckoutPreviewDto } from './checkout.dto';
import type { OrderPreview, CheckoutItem, AddressSnapshot } from './checkout.types';
import type { ICartRepository } from '@/modules/cart';
import type { ICustomerRepository } from '@/modules/customer';
import { PricingService } from '@/modules/pricing';
import { BadRequestError, NotFoundError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger/logger';

export class CheckoutService implements ICheckoutService {
  private readonly pricingService: PricingService;

  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly customerRepository: ICustomerRepository
  ) {
    this.pricingService = new PricingService();
  }

  async previewOrder(userId: string, dto: CheckoutPreviewDto): Promise<OrderPreview> {
    // Gate 1 — Customer profile must exist (auto-create if first time)
    let profile = await this.customerRepository.findProfileByUserId(userId);
    if (!profile) {
      profile = await this.customerRepository.upsertProfile(userId, {});
    }

    // Gate 2 — Delivery address must exist and belong to this customer
    const address = await this.customerRepository.findAddressById(dto.addressId, userId);
    if (!address) {
      throw new NotFoundError('Delivery address not found');
    }

    // Gate 3 — Cart must exist and not be empty
    const rawCart = await this.cartRepository.findCartByCustomerId(profile.id);
    if (!rawCart || !rawCart.items || rawCart.items.length === 0) {
      throw new BadRequestError('Your cart is empty');
    }

    // Gate 4–8 — Validate every item in cart
    const validatedItems: CheckoutItem[] = [];
    const pricingInputs: { variantId: string; unitPrice: number; quantity: number }[] = [];

    for (const cartItem of rawCart.items) {
      const variant = cartItem.variant;
      const product = variant?.product;
      const vendor = product?.vendor;
      const inventory = variant?.inventory;

      // Gate 4: Product must be active
      if (!product || product.status !== 'ACTIVE') {
        throw new BadRequestError(
          `Product "${product?.name ?? 'unknown'}" is no longer available`
        );
      }

      // Gate 5: Variant must be active
      if (!variant || variant.status !== 'ACTIVE') {
        throw new BadRequestError(
          `A variant of "${product.name}" is currently inactive`
        );
      }

      // Gate 6: Vendor must be active
      if (!vendor || vendor.status !== 'ACTIVE') {
        throw new BadRequestError(
          `The vendor selling "${product.name}" is currently unavailable`
        );
      }

      // Gate 7: Price is taken server-side, not trusted from client
      const serverUnitPrice = variant.price;

      // Gate 8: Stock availability check
      const availableQty = inventory?.availableQuantity ?? 0;
      const reservedQty = inventory?.reservedQuantity ?? 0;
      const sellableQty = Math.max(0, availableQty - reservedQty);

      if (sellableQty < cartItem.quantity) {
        throw new BadRequestError(
          `Insufficient stock for "${product.name}" — ${variant.sku}. ` +
          `Requested: ${cartItem.quantity}, Available: ${sellableQty}`
        );
      }

      // Find primary product image
      const primaryImage =
        product.images?.find((img: { isPrimary: boolean; url: string }) => img.isPrimary)?.url ??
        product.images?.[0]?.url ?? null;

      validatedItems.push({
        cartItemId: cartItem.id,
        variantId: variant.id,
        productId: product.id,
        vendorId: vendor.id,
        productName: product.name,
        sku: variant.sku,
        unitPrice: serverUnitPrice,
        quantity: cartItem.quantity,
        totalPrice: parseFloat((serverUnitPrice * cartItem.quantity).toFixed(2)),
        variantAttributes: (variant.attributes || []).map((attr: { name: string; value: string }) => ({
          name: attr.name,
          value: attr.value,
        })),
        productImage: primaryImage,
      });

      pricingInputs.push({
        variantId: variant.id,
        unitPrice: serverUnitPrice,
        quantity: cartItem.quantity,
      });
    }

    // Calculate final pricing breakdown
    const pricing = this.pricingService.calculate(pricingInputs);

    // Build address snapshot (immutable copy for use in future order)
    const deliveryAddress: AddressSnapshot = {
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? null,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    };

    logger.info('[Checkout] Order preview generated', {
      userId,
      itemCount: validatedItems.length,
      grandTotal: pricing.grandTotal,
    });

    return {
      items: validatedItems,
      pricing,
      deliveryAddress,
      isReadyForOrder: true,
    };
  }
}
