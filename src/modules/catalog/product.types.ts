export type ProductStatusType = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface ProductImageEntity {
  id: string;
  productId: string;
  url: string;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: Date;
}

export interface ProductEntity {
  id: string;
  vendorId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  price: number;
  stock: number;
  status: ProductStatusType;
  createdAt: Date;
  updatedAt: Date;
  images?: ProductImageEntity[];
}
