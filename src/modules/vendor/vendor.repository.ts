import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '@/lib/db/prisma';
import type { IVendorRepository } from './vendor.contracts';
import type { VendorProfileEntity, VendorStatusType } from './vendor.types';
import type { UpdateVendorProfileDto } from './vendor.dto';

export class VendorRepository implements IVendorRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}
  async findProfileByUserId(userId: string): Promise<VendorProfileEntity | null> {
    return this.prisma.vendorProfile.findUnique({
      where: { userId },
    });
  }

  async upsertProfile(
    userId: string,
    dto: UpdateVendorProfileDto & { businessName: string }
  ): Promise<VendorProfileEntity> {
    return this.prisma.vendorProfile.upsert({
      where: { userId },
      create: {
        userId,
        businessName: dto.businessName,
        businessDescription: dto.businessDescription,
        businessPhone: dto.businessPhone,
        businessEmail: dto.businessEmail,
        logo: dto.logo,
        status: 'PENDING',
      },
      update: {
        ...(dto.businessName !== undefined && { businessName: dto.businessName }),
        ...(dto.businessDescription !== undefined && { businessDescription: dto.businessDescription }),
        ...(dto.businessPhone !== undefined && { businessPhone: dto.businessPhone }),
        ...(dto.businessEmail !== undefined && { businessEmail: dto.businessEmail }),
        ...(dto.logo !== undefined && { logo: dto.logo }),
      },
    });
  }

  async updateStatus(userId: string, status: VendorStatusType): Promise<VendorProfileEntity> {
    return this.prisma.vendorProfile.update({
      where: { userId },
      data: { status },
    });
  }
}
