import type { CustomerProfileEntity, AddressEntity } from './customer.types';
import type {
  UpdateCustomerProfileDto,
  CreateAddressDto,
  UpdateAddressDto,
} from './customer.dto';

//  Customer Repository Contract 

export interface ICustomerRepository {
  findProfileByUserId(userId: string): Promise<CustomerProfileEntity | null>;
  upsertProfile(userId: string, dto: UpdateCustomerProfileDto): Promise<CustomerProfileEntity>;
  findAddressesByUserId(userId: string): Promise<AddressEntity[]>;
  findAddressById(addressId: string, userId: string): Promise<AddressEntity | null>;
  createAddress(userId: string, dto: CreateAddressDto): Promise<AddressEntity>;
  updateAddress(addressId: string, userId: string, dto: UpdateAddressDto): Promise<AddressEntity>;
  deleteAddress(addressId: string, userId: string): Promise<void>;
  setDefaultAddress(addressId: string, userId: string): Promise<AddressEntity>;
}

//  Customer Service Contract 

export interface ICustomerService {
  getProfile(userId: string): Promise<CustomerProfileEntity>;
  updateProfile(userId: string, dto: UpdateCustomerProfileDto): Promise<CustomerProfileEntity>;
  getAddresses(userId: string): Promise<AddressEntity[]>;
  createAddress(userId: string, dto: CreateAddressDto): Promise<AddressEntity>;
  updateAddress(addressId: string, userId: string, dto: UpdateAddressDto): Promise<AddressEntity>;
  deleteAddress(addressId: string, userId: string): Promise<void>;
  setDefaultAddress(addressId: string, userId: string): Promise<AddressEntity>;
}
