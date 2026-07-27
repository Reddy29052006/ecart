import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '@/lib/db/prisma';
import type { ICategoryRepository } from './category.contracts';
import type { CategoryEntity } from './category.types';
import type { CreateCategoryDto, UpdateCategoryDto } from './category.dto';

export class CategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async findMany(): Promise<CategoryEntity[]> {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string): Promise<CategoryEntity | null> {
    return this.prisma.category.findUnique({
      where: { slug },
    });
  }

  async create(dto: CreateCategoryDto & { slug: string }): Promise<CategoryEntity> {
    return this.prisma.category.create({
      data: {
        parentCategoryId: dto.parentCategoryId,
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        image: dto.image,
        status: dto.status ?? 'ACTIVE',
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto & { slug?: string }): Promise<CategoryEntity> {
    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id },
    });
  }
}
