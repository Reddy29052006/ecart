import type { CategoryStatusType } from './category.types';

export interface CreateCategoryDto {
  parentCategoryId?: string;
  name: string;
  description?: string;
  image?: string;
  status?: CategoryStatusType;
}

export interface UpdateCategoryDto {
  parentCategoryId?: string;
  name?: string;
  description?: string;
  image?: string;
  status?: CategoryStatusType;
}
