import type { VendorProfileEntity, VendorStatusType } from './vendor.types';
import type { UpdateVendorProfileDto } from './vendor.dto';

//  Vendor Repository Contract 

export interface IVendorRepository {
  findProfileByUserId(userId: string): Promise<VendorProfileEntity | null>;
  findProfileById(id: string): Promise<VendorProfileEntity | null>;
  upsertProfile(userId: string, dto: UpdateVendorProfileDto & { businessName: string }): Promise<VendorProfileEntity>;
  updateStatus(userId: string, status: VendorStatusType): Promise<VendorProfileEntity>;
}

//  Vendor Service Contract

export interface IVendorService {
  getProfile(userId: string): Promise<VendorProfileEntity>;
  updateProfile(userId: string, dto: UpdateVendorProfileDto): Promise<VendorProfileEntity>;
  updateStatus(userId: string, status: VendorStatusType): Promise<VendorProfileEntity>;
}
