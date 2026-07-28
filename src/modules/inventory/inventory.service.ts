import type { IInventoryRepository, IInventoryService } from './inventory.contracts';
import type { IProductRepository } from '@/modules/catalog/product.contracts';
import type { ProductVariantEntity, InventoryEntity, InventoryMovementEntity } from './inventory.types';
import type { CreateVariantDto, UpdateVariantDto, AddStockDto, AdjustStockDto } from './inventory.dto';
import { NotFoundError, ForbiddenError, ConflictError, BadRequestError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger/logger';

type InventoryWithSellable = InventoryEntity & { sellableQuantity: number };

function withSellable(inv: InventoryEntity): InventoryWithSellable {
  return { ...inv, sellableQuantity: inv.availableQuantity - inv.reservedQuantity };
}

export class InventoryService implements IInventoryService {
  constructor(
    private readonly inventoryRepository: IInventoryRepository,
    private readonly productRepository: IProductRepository
  ) {}

  // Verify the product exists and the vendor actually owns it
  private async assertProductOwnership(productId: string, vendorId: string): Promise<void> {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new NotFoundError('Product not found');
    if (product.vendorId !== vendorId) throw new ForbiddenError('You do not have permission to manage this product');
  }

  // Verify a variant belongs to a specific product (and optionally that vendor owns the product)
  private async assertVariantOwnership(variantId: string, productId: string, vendorId: string): Promise<ProductVariantEntity> {
    await this.assertProductOwnership(productId, vendorId);
    const variant = await this.inventoryRepository.findVariantById(variantId);
    if (!variant) throw new NotFoundError('Variant not found');
    if (variant.productId !== productId) throw new ForbiddenError('Variant does not belong to this product');
    return variant;
  }

  async getVariants(productId: string, vendorId: string): Promise<ProductVariantEntity[]> {
    await this.assertProductOwnership(productId, vendorId);
    return this.inventoryRepository.findVariantsByProductId(productId);
  }

  async getVariant(variantId: string, productId: string, vendorId: string): Promise<ProductVariantEntity> {
    return this.assertVariantOwnership(variantId, productId, vendorId);
  }

  async createVariant(productId: string, vendorId: string, dto: CreateVariantDto): Promise<ProductVariantEntity> {
    await this.assertProductOwnership(productId, vendorId);

    // SKU must be unique across the entire catalog
    const existing = await this.inventoryRepository.findVariantBySku(dto.sku.toUpperCase());
    if (existing) throw new ConflictError(`SKU "${dto.sku.toUpperCase()}" is already in use`);

    const variant = await this.inventoryRepository.createVariant(productId, dto);
    logger.info('Variant created', { variantId: variant.id, sku: variant.sku, productId });
    return variant;
  }

  async updateVariant(variantId: string, productId: string, vendorId: string, dto: UpdateVariantDto): Promise<ProductVariantEntity> {
    const existing = await this.assertVariantOwnership(variantId, productId, vendorId);

    if (dto.sku && dto.sku.toUpperCase() !== existing.sku) {
      const skuConflict = await this.inventoryRepository.findVariantBySku(dto.sku.toUpperCase());
      if (skuConflict) throw new ConflictError(`SKU "${dto.sku.toUpperCase()}" is already in use`);
    }

    const updated = await this.inventoryRepository.updateVariant(variantId, dto);
    logger.info('Variant updated', { variantId, productId });
    return updated;
  }

  async deleteVariant(variantId: string, productId: string, vendorId: string): Promise<void> {
    await this.assertVariantOwnership(variantId, productId, vendorId);
    await this.inventoryRepository.deleteVariant(variantId);
    logger.info('Variant deleted', { variantId, productId });
  }

  async getInventory(variantId: string, productId: string, vendorId: string): Promise<InventoryWithSellable> {
    await this.assertVariantOwnership(variantId, productId, vendorId);
    const inv = await this.inventoryRepository.getInventory(variantId);
    if (!inv) throw new NotFoundError('Inventory record not found');
    return withSellable(inv);
  }

  async addStock(variantId: string, productId: string, vendorId: string, dto: AddStockDto): Promise<InventoryWithSellable> {
    await this.assertVariantOwnership(variantId, productId, vendorId);
    const inv = await this.inventoryRepository.addStock(variantId, dto);
    logger.info('Stock added', { variantId, quantity: dto.quantity });
    return withSellable(inv);
  }

  async adjustStock(variantId: string, productId: string, vendorId: string, dto: AdjustStockDto): Promise<InventoryWithSellable> {
    await this.assertVariantOwnership(variantId, productId, vendorId);

    // Prevent stock going below zero
    const current = await this.inventoryRepository.getInventory(variantId);
    if (!current) throw new NotFoundError('Inventory record not found');
    const newQty = current.availableQuantity + dto.quantity;
    if (newQty < 0) {
      throw new BadRequestError(`Adjustment would result in negative stock (current: ${current.availableQuantity}, delta: ${dto.quantity})`);
    }

    const inv = await this.inventoryRepository.adjustStock(variantId, dto);
    logger.info('Stock adjusted', { variantId, delta: dto.quantity });
    return withSellable(inv);
  }

  async getMovements(variantId: string, productId: string, vendorId: string): Promise<InventoryMovementEntity[]> {
    await this.assertVariantOwnership(variantId, productId, vendorId);
    return this.inventoryRepository.getMovements(variantId);
  }
}
