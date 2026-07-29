import type { IProductRepository, IProductService } from './product.contracts';
import type { ICategoryRepository } from './category.contracts';
import type { ProductEntity, ProductImageEntity, ProductStatusType } from './product.types';
import type { CreateProductDto, UpdateProductDto, AddProductImageDto } from './product.dto';
import { NotFoundError, ForbiddenError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger/logger';
import { generateSlug } from '@/lib/utils/slug';

import type { ProductQueryDto, PaginatedProductsResult } from './catalog.dto';

export class ProductService implements IProductService {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async getVendorProducts(vendorId: string): Promise<ProductEntity[]> {
    return this.productRepository.findManyByVendorId(vendorId);
  }

  async getProductById(id: string, vendorId?: string): Promise<ProductEntity> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    if (vendorId && product.vendorId !== vendorId) {
      throw new ForbiddenError('You do not have permission to access this product');
    }
    return product;
  }

  async getPublicProducts(query: ProductQueryDto): Promise<PaginatedProductsResult> {
    return this.productRepository.findPublicProducts(query);
  }

  async getPublicProductDetails(slugOrId: string): Promise<ProductEntity & { inStock: boolean }> {
    const product = await this.productRepository.findPublicProductBySlugOrId(slugOrId);
    if (!product) {
      throw new NotFoundError('Product not found or currently unavailable');
    }
    return {
      ...product,
      inStock: product.stock > 0,
    };
  }

  async createProduct(vendorId: string, dto: CreateProductDto): Promise<ProductEntity> {
    const category = await this.categoryRepository.findById(dto.categoryId);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    let slug = generateSlug(dto.name);
    const existingSlug = await this.productRepository.findBySlug(slug);
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const product = await this.productRepository.create(vendorId, { ...dto, slug });
    logger.info(`[Product] Created product`, { productId: product.id, vendorId, slug });
    return product;
  }

  async updateProduct(id: string, vendorId: string, dto: UpdateProductDto): Promise<ProductEntity> {
    const existing = await this.getProductById(id, vendorId);

    if (dto.categoryId && dto.categoryId !== existing.categoryId) {
      const category = await this.categoryRepository.findById(dto.categoryId);
      if (!category) {
        throw new NotFoundError('Category not found');
      }
    }

    let slug: string | undefined = undefined;
    if (dto.name && dto.name !== existing.name) {
      slug = generateSlug(dto.name);
      const slugConflict = await this.productRepository.findBySlug(slug);
      if (slugConflict && slugConflict.id !== id) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }
    }

    const updated = await this.productRepository.update(id, {
      ...dto,
      ...(slug !== undefined && { slug }),
    });
    logger.info(`[Product] Updated product`, { productId: id, vendorId });
    return updated;
  }

  async updateProductStatus(id: string, vendorId: string, status: ProductStatusType): Promise<ProductEntity> {
    await this.getProductById(id, vendorId);
    const updated = await this.productRepository.updateStatus(id, status);
    logger.info(`[Product] Updated product status to ${status}`, { productId: id, vendorId });
    return updated;
  }

  async addProductImage(productId: string, vendorId: string, dto: AddProductImageDto): Promise<ProductImageEntity> {
    await this.getProductById(productId, vendorId);
    const image = await this.productRepository.addImage(productId, dto);
    logger.info(`[Product] Added image`, { productId, imageId: image.id });
    return image;
  }

  async deleteProductImage(imageId: string, productId: string, vendorId: string): Promise<void> {
    await this.getProductById(productId, vendorId);
    await this.productRepository.deleteImage(imageId, productId);
    logger.info(`[Product] Deleted image`, { productId, imageId });
  }

  async setPrimaryProductImage(imageId: string, productId: string, vendorId: string): Promise<ProductImageEntity> {
    await this.getProductById(productId, vendorId);
    const primaryImage = await this.productRepository.setPrimaryImage(imageId, productId);
    logger.info(`[Product] Set primary image`, { productId, imageId });
    return primaryImage;
  }
}
