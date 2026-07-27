import type { ICustomerRepository, ICustomerService } from './customer.contracts';
import type { CustomerProfileEntity, AddressEntity } from './customer.types';
import type { UpdateCustomerProfileDto, CreateAddressDto, UpdateAddressDto } from './customer.dto';
import { NotFoundError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger/logger';

export class CustomerService implements ICustomerService {
  constructor(private readonly customerRepository: ICustomerRepository) {}

  async getProfile(userId: string): Promise<CustomerProfileEntity> {
    let profile = await this.customerRepository.findProfileByUserId(userId);
    if (!profile) {
      // Auto-create initial profile for existing customer identity
      profile = await this.customerRepository.upsertProfile(userId, {});
      logger.info(`[Customer] Initial profile created for user`, { userId });
    }
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateCustomerProfileDto): Promise<CustomerProfileEntity> {
    const updated = await this.customerRepository.upsertProfile(userId, dto);
    logger.info(`[Customer] Profile updated`, { userId });
    return updated;
  }

  async getAddresses(userId: string): Promise<AddressEntity[]> {
    return this.customerRepository.findAddressesByUserId(userId);
  }

  async createAddress(userId: string, dto: CreateAddressDto): Promise<AddressEntity> {
    const address = await this.customerRepository.createAddress(userId, dto);
    logger.info(`[Customer] Address created`, { userId, addressId: address.id });
    return address;
  }

  async updateAddress(addressId: string, userId: string, dto: UpdateAddressDto): Promise<AddressEntity> {
    const existing = await this.customerRepository.findAddressById(addressId, userId);
    if (!existing) {
      throw new NotFoundError('Address not found');
    }
    const updated = await this.customerRepository.updateAddress(addressId, userId, dto);
    logger.info(`[Customer] Address updated`, { userId, addressId });
    return updated;
  }

  async deleteAddress(addressId: string, userId: string): Promise<void> {
    const existing = await this.customerRepository.findAddressById(addressId, userId);
    if (!existing) {
      throw new NotFoundError('Address not found');
    }
    await this.customerRepository.deleteAddress(addressId, userId);
    logger.info(`[Customer] Address deleted`, { userId, addressId });
  }

  async setDefaultAddress(addressId: string, userId: string): Promise<AddressEntity> {
    const existing = await this.customerRepository.findAddressById(addressId, userId);
    if (!existing) {
      throw new NotFoundError('Address not found');
    }
    const defaultAddress = await this.customerRepository.setDefaultAddress(addressId, userId);
    logger.info(`[Customer] Default address set`, { userId, addressId });
    return defaultAddress;
  }
}
