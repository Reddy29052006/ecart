export type CategoryStatusType = 'ACTIVE' | 'INACTIVE';

export interface CategoryEntity {
  id: string;
  parentCategoryId: string | null;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  status: CategoryStatusType;
  createdAt: Date;
  updatedAt: Date;
}
