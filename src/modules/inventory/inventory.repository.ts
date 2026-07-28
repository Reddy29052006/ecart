import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '@/lib/db/prisma';
import type { IInventoryRepository } from './inventory.contracts';
import type { ProductVariantEntity, InventoryEntity, InventoryMovementEntity } from './inventory.types';
import type { CreateVariantDto, UpdateVariantDto, AddStockDto, AdjustStockDto } from './inventory.dto';

export class InventoryRepository implements IInventoryRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async findVariantsByProductId(productId: string): Promise<ProductVariantEntity[]> {
    return this.prisma.productVariant.findMany({
      where: { productId },
      include: {
        attributes: true,
        inventory: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findVariantById(variantId: string): Promise<ProductVariantEntity | null> {
    return this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        attributes: true,
        inventory: true,
      },
    });
  }

  async findVariantBySku(sku: string): Promise<ProductVariantEntity | null> {
    return this.prisma.productVariant.findUnique({
      where: { sku },
      include: { attributes: true, inventory: true },
    });
  }

  async createVariant(productId: string, dto: CreateVariantDto): Promise<ProductVariantEntity> {
    return this.prisma.productVariant.create({
      data: {
        productId,
        sku: dto.sku.toUpperCase(),
        price: dto.price,
        status: dto.status ?? 'ACTIVE',
        lowStockThreshold: dto.lowStockThreshold ?? 5,
        attributes: {
          create: (dto.attributes ?? []).map((attr) => ({
            name: attr.name,
            value: attr.value,
          })),
        },
        // Auto-create Inventory record on variant creation
        inventory: {
          create: {
            availableQuantity: 0,
            reservedQuantity: 0,
          },
        },
      },
      include: { attributes: true, inventory: true },
    });
  }

  async updateVariant(variantId: string, dto: UpdateVariantDto): Promise<ProductVariantEntity> {
    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        ...(dto.sku && { sku: dto.sku.toUpperCase() }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.status && { status: dto.status }),
        ...(dto.lowStockThreshold !== undefined && { lowStockThreshold: dto.lowStockThreshold }),
      },
      include: { attributes: true, inventory: true },
    });
  }

  async deleteVariant(variantId: string): Promise<void> {
    await this.prisma.productVariant.delete({ where: { id: variantId } });
  }

  async getInventory(variantId: string): Promise<InventoryEntity | null> {
    return this.prisma.inventory.findUnique({ where: { variantId } });
  }

  async addStock(variantId: string, dto: AddStockDto): Promise<InventoryEntity> {
    const [inventory] = await this.prisma.$transaction([
      this.prisma.inventory.update({
        where: { variantId },
        data: { availableQuantity: { increment: dto.quantity } },
      }),
      this.prisma.inventoryMovement.create({
        data: {
          variantId,
          type: 'STOCK_IN',
          quantity: dto.quantity,
          note: dto.note,
          referenceType: dto.referenceType,
          referenceId: dto.referenceId,
        },
      }),
    ]);
    return inventory;
  }

  async adjustStock(variantId: string, dto: AdjustStockDto): Promise<InventoryEntity> {
    const [inventory] = await this.prisma.$transaction([
      this.prisma.inventory.update({
        where: { variantId },
        data: { availableQuantity: { increment: dto.quantity } },
      }),
      this.prisma.inventoryMovement.create({
        data: {
          variantId,
          type: 'ADJUSTMENT',
          quantity: dto.quantity,
          note: dto.note,
        },
      }),
    ]);
    return inventory;
  }

  async getMovements(variantId: string): Promise<InventoryMovementEntity[]> {
    return this.prisma.inventoryMovement.findMany({
      where: { variantId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
