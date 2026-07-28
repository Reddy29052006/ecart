import type {
  ProductVariantEntity,
  InventoryEntity,
  InventoryMovementEntity,
} from './inventory.types';
import type { CreateVariantDto, UpdateVariantDto, AddStockDto, AdjustStockDto } from './inventory.dto';

export interface IInventoryRepository {
  findVariantsByProductId(productId: string): Promise<ProductVariantEntity[]>;
  findVariantById(variantId: string): Promise<ProductVariantEntity | null>;
  findVariantBySku(sku: string): Promise<ProductVariantEntity | null>;
  createVariant(productId: string, dto: CreateVariantDto): Promise<ProductVariantEntity>;
  updateVariant(variantId: string, dto: UpdateVariantDto): Promise<ProductVariantEntity>;
  deleteVariant(variantId: string): Promise<void>;

  getInventory(variantId: string): Promise<InventoryEntity | null>;
  addStock(variantId: string, dto: AddStockDto): Promise<InventoryEntity>;
  adjustStock(variantId: string, dto: AdjustStockDto): Promise<InventoryEntity>;
  getMovements(variantId: string): Promise<InventoryMovementEntity[]>;
}

export interface IInventoryService {
  getVariants(productId: string, vendorId: string): Promise<ProductVariantEntity[]>;
  getVariant(variantId: string, productId: string, vendorId: string): Promise<ProductVariantEntity>;
  createVariant(productId: string, vendorId: string, dto: CreateVariantDto): Promise<ProductVariantEntity>;
  updateVariant(variantId: string, productId: string, vendorId: string, dto: UpdateVariantDto): Promise<ProductVariantEntity>;
  deleteVariant(variantId: string, productId: string, vendorId: string): Promise<void>;

  getInventory(variantId: string, productId: string, vendorId: string): Promise<InventoryEntity & { sellableQuantity: number }>;
  addStock(variantId: string, productId: string, vendorId: string, dto: AddStockDto): Promise<InventoryEntity & { sellableQuantity: number }>;
  adjustStock(variantId: string, productId: string, vendorId: string, dto: AdjustStockDto): Promise<InventoryEntity & { sellableQuantity: number }>;
  getMovements(variantId: string, productId: string, vendorId: string): Promise<InventoryMovementEntity[]>;
}
