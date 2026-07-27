import type { CategoryEntity } from './category.types';
import type { CreateCategoryDto, UpdateCategoryDto } from './category.dto';

export interface ICategoryRepository {
  findMany(): Promise<CategoryEntity[]>;
  findById(id: string): Promise<CategoryEntity | null>;
  findBySlug(slug: string): Promise<CategoryEntity | null>;
  create(dto: CreateCategoryDto & { slug: string }): Promise<CategoryEntity>;
  update(id: string, dto: UpdateCategoryDto & { slug?: string }): Promise<CategoryEntity>;
  delete(id: string): Promise<void>;
}

export interface ICategoryService {
  getCategories(): Promise<CategoryEntity[]>;
  getCategoryById(id: string): Promise<CategoryEntity>;
  createCategory(dto: CreateCategoryDto): Promise<CategoryEntity>;
  updateCategory(id: string, dto: UpdateCategoryDto): Promise<CategoryEntity>;
  deleteCategory(id: string): Promise<void>;
}
