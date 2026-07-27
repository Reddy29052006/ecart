import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '@/lib/db/prisma';
import type { ICustomerRepository } from './customer.contracts';
import type { CustomerProfileEntity, AddressEntity } from './customer.types';
import type { UpdateCustomerProfileDto, CreateAddressDto, UpdateAddressDto } from './customer.dto';

export class CustomerRepository implements ICustomerRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}
  async findProfileByUserId(userId: string): Promise<CustomerProfileEntity | null> {
    return this.prisma.customerProfile.findUnique({
      where: { userId },
    });
  }

  async upsertProfile(userId: string, dto: UpdateCustomerProfileDto): Promise<CustomerProfileEntity> {
    return this.prisma.customerProfile.upsert({
      where: { userId },
      create: {
        userId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        displayName: dto.displayName,
        profileImage: dto.profileImage,
      },
      update: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.displayName !== undefined && { displayName: dto.displayName }),
        ...(dto.profileImage !== undefined && { profileImage: dto.profileImage }),
      },
    });
  }

  async findAddressesByUserId(userId: string): Promise<AddressEntity[]> {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findAddressById(addressId: string, userId: string): Promise<AddressEntity | null> {
    return this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
  }

  async createAddress(userId: string, dto: CreateAddressDto): Promise<AddressEntity> {
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    // If this is the user's first address, force isDefault = true
    const existingCount = await this.prisma.address.count({ where: { userId } });
    const isDefault = existingCount === 0 ? true : (dto.isDefault ?? false);

    return this.prisma.address.create({
      data: {
        userId,
        label: dto.label,
        fullName: dto.fullName,
        phone: dto.phone,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country ?? 'IN',
        isDefault,
      },
    });
  }

  async updateAddress(addressId: string, userId: string, dto: UpdateAddressDto): Promise<AddressEntity> {
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id: addressId },
      data: dto,
    });
  }

  async deleteAddress(addressId: string, userId: string): Promise<void> {
    const deleted = await this.prisma.address.delete({
      where: { id: addressId },
    });

    // If deleted address was default, set another address as default if exists
    if (deleted.isDefault) {
      const firstRemaining = await this.prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (firstRemaining) {
        await this.prisma.address.update({
          where: { id: firstRemaining.id },
          data: { isDefault: true },
        });
      }
    }
  }

  async setDefaultAddress(addressId: string, userId: string): Promise<AddressEntity> {
    await this.prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    return this.prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  }
}
