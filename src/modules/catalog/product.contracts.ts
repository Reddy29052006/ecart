import type { ProductEntity, ProductImageEntity, ProductStatusType } from './product.types';
import type { CreateProductDto, UpdateProductDto, AddProductImageDto } from './product.dto';
import type { ProductQueryDto, PaginatedProductsResult } from './catalog.dto';

export interface IProductRepository {
  findManyByVendorId(vendorId: string): Promise<ProductEntity[]>;
  findById(id: string): Promise<ProductEntity | null>;
  findBySlug(slug: string): Promise<ProductEntity | null>;
  findPublicProducts(query: ProductQueryDto): Promise<PaginatedProductsResult>;
  findPublicProductBySlugOrId(slugOrId: string): Promise<ProductEntity | null>;
  create(vendorId: string, dto: CreateProductDto & { slug: string }): Promise<ProductEntity>;
  update(id: string, dto: UpdateProductDto & { slug?: string }): Promise<ProductEntity>;
  updateStatus(id: string, status: ProductStatusType): Promise<ProductEntity>;
  addImage(productId: string, dto: AddProductImageDto): Promise<ProductImageEntity>;
  deleteImage(imageId: string, productId: string): Promise<void>;
  setPrimaryImage(imageId: string, productId: string): Promise<ProductImageEntity>;
}

export interface IProductService {
  getVendorProducts(vendorId: string): Promise<ProductEntity[]>;
  getProductById(id: string, vendorId?: string): Promise<ProductEntity>;
  getPublicProducts(query: ProductQueryDto): Promise<PaginatedProductsResult>;
  getPublicProductDetails(slugOrId: string): Promise<ProductEntity & { inStock: boolean }>;
  createProduct(vendorId: string, dto: CreateProductDto): Promise<ProductEntity>;
  updateProduct(id: string, vendorId: string, dto: UpdateProductDto): Promise<ProductEntity>;
  updateProductStatus(id: string, vendorId: string, status: ProductStatusType): Promise<ProductEntity>;
  addProductImage(productId: string, vendorId: string, dto: AddProductImageDto): Promise<ProductImageEntity>;
  deleteProductImage(imageId: string, productId: string, vendorId: string): Promise<void>;
  setPrimaryProductImage(imageId: string, productId: string, vendorId: string): Promise<ProductImageEntity>;
}
