import { PrismaClient, Prisma } from '@prisma/client';
import { prisma as defaultPrisma } from '@/lib/db/prisma';
import type { IProductRepository } from './product.contracts';
import type { ProductEntity, ProductImageEntity, ProductStatusType } from './product.types';
import type { CreateProductDto, UpdateProductDto, AddProductImageDto } from './product.dto';

import type { ProductQueryDto, PaginatedProductsResult } from './catalog.dto';

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

  async findPublicProducts(query: ProductQueryDto): Promise<PaginatedProductsResult> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const skip = (page - 1) * pageSize;

    // Build Prisma filter clauses for active products
    const whereClause: Prisma.ProductWhereInput = {
      status: 'ACTIVE',
    };

    if (query.search) {
      whereClause.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { brand: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.categoryId) {
      whereClause.categoryId = query.categoryId;
    } else if (query.categorySlug) {
      whereClause.category = { slug: query.categorySlug };
    }

    if (query.brand) {
      whereClause.brand = { equals: query.brand, mode: 'insensitive' };
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      whereClause.price = {
        ...(query.minPrice !== undefined && { gte: query.minPrice }),
        ...(query.maxPrice !== undefined && { lte: query.maxPrice }),
      };
    }

    if (query.inStock) {
      whereClause.stock = { gt: 0 };
    }

    // Build sorting clause
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (query.sortBy === 'price_desc') {
      orderBy = { price: 'desc' };
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        orderBy,
        include: {
          images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
          category: { select: { id: true, name: true, slug: true } },
          vendor: { select: { id: true, businessName: true } },
        },
      }),
      this.prisma.product.count({ where: whereClause }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    };
  }

  async findPublicProductBySlugOrId(slugOrId: string): Promise<ProductEntity | null> {
    return this.prisma.product.findFirst({
      where: {
        status: 'ACTIVE',
        OR: [{ id: slugOrId }, { slug: slugOrId }],
      },
      include: {
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
        category: true,
        vendor: {
          select: {
            id: true,
            businessName: true,
            businessDescription: true,
            logo: true,
          },
        },
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
