import type { ICategoryRepository, ICategoryService } from './category.contracts';
import type { CategoryEntity } from './category.types';
import type { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
import { NotFoundError, ConflictError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger/logger';
import { generateSlug } from '@/lib/utils/slug';

export class CategoryService implements ICategoryService {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async getCategories(): Promise<CategoryEntity[]> {
    return this.categoryRepository.findMany();
  }

  async getCategoryById(id: string): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    return category;
  }

  async createCategory(dto: CreateCategoryDto): Promise<CategoryEntity> {
    const slug = generateSlug(dto.name);
    const existing = await this.categoryRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictError(`Category with slug "${slug}" already exists`);
    }

    if (dto.parentCategoryId) {
      const parent = await this.categoryRepository.findById(dto.parentCategoryId);
      if (!parent) {
        throw new NotFoundError('Parent category not found');
      }
    }

    const category = await this.categoryRepository.create({ ...dto, slug });
    logger.info(`[Category] Created category`, { categoryId: category.id, slug });
    return category;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto): Promise<CategoryEntity> {
    const existing = await this.getCategoryById(id);
    let slug: string | undefined = undefined;

    if (dto.name && dto.name !== existing.name) {
      slug = generateSlug(dto.name);
      const slugConflict = await this.categoryRepository.findBySlug(slug);
      if (slugConflict && slugConflict.id !== id) {
        throw new ConflictError(`Category with slug "${slug}" already exists`);
      }
    }

    const updated = await this.categoryRepository.update(id, {
      ...dto,
      ...(slug !== undefined && { slug }),
    });
    logger.info(`[Category] Updated category`, { categoryId: id });
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    await this.getCategoryById(id);
    await this.categoryRepository.delete(id);
    logger.info(`[Category] Deleted category`, { categoryId: id });
  }
}
