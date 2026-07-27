import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '@/lib/db/prisma';
import type { IProductRepository } from './product.contracts';
import type { ProductEntity, ProductImageEntity, ProductStatusType } from './product.types';
import type { CreateProductDto, UpdateProductDto, AddProductImageDto } from './product.dto';

export class ProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async findManyByVendorId(vendorId: string): Promise<ProductEntity[]> {
    return this.prisma.product.findMany({
      where: { vendorId },
      include: {
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<ProductEntity | null> {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
      },
    });
  }

  async findBySlug(slug: string): Promise<ProductEntity | null> {
    return this.prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
      },
    });
  }

  async create(vendorId: string, dto: CreateProductDto & { slug: string }): Promise<ProductEntity> {
    return this.prisma.product.create({
      data: {
        vendorId,
        categoryId: dto.categoryId,
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        brand: dto.brand,
        price: dto.price,
        stock: dto.stock ?? 0,
        status: 'DRAFT',
      },
      include: { images: true },
    });
  }

  async update(id: string, dto: UpdateProductDto & { slug?: string }): Promise<ProductEntity> {
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { images: true },
    });
  }

  async updateStatus(id: string, status: ProductStatusType): Promise<ProductEntity> {
    return this.prisma.product.update({
      where: { id },
      data: { status },
      include: { images: true },
    });
  }

  async addImage(productId: string, dto: AddProductImageDto): Promise<ProductImageEntity> {
    if (dto.isPrimary) {
      await this.prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });
    }

    const existingCount = await this.prisma.productImage.count({ where: { productId } });
    const isPrimary = existingCount === 0 ? true : (dto.isPrimary ?? false);

    return this.prisma.productImage.create({
      data: {
        productId,
        url: dto.url,
        sortOrder: dto.sortOrder ?? 0,
        isPrimary,
      },
    });
  }

  async deleteImage(imageId: string, productId: string): Promise<void> {
    const deleted = await this.prisma.productImage.delete({
      where: { id: imageId },
    });

    if (deleted.isPrimary) {
      const firstRemaining = await this.prisma.productImage.findFirst({
        where: { productId },
        orderBy: { sortOrder: 'asc' },
      });
      if (firstRemaining) {
        await this.prisma.productImage.update({
          where: { id: firstRemaining.id },
          data: { isPrimary: true },
        });
      }
    }
  }

  async setPrimaryImage(imageId: string, productId: string): Promise<ProductImageEntity> {
    await this.prisma.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false },
    });

    return this.prisma.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    });
  }
}
