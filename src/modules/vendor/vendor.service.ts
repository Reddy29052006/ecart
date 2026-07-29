import type { IVendorRepository, IVendorService } from './vendor.contracts';
import type { VendorProfileEntity, VendorStatusType } from './vendor.types';
import type { UpdateVendorProfileDto } from './vendor.dto';
import { logger } from '@/lib/logger/logger';

export class VendorService implements IVendorService {
  constructor(private readonly vendorRepository: IVendorRepository) {}

  async getProfile(userId: string): Promise<VendorProfileEntity> {
    let profile = await this.vendorRepository.findProfileByUserId(userId);
    if (!profile) {
      // Auto-create initial pending vendor profile
      profile = await this.vendorRepository.upsertProfile(userId, {
        businessName: 'My Vendor Store',
      });
      logger.info(`[Vendor] Initial profile created for user`, { userId });
    }
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateVendorProfileDto): Promise<VendorProfileEntity> {
    const existing = await this.getProfile(userId);
    const updated = await this.vendorRepository.upsertProfile(userId, {
      ...dto,
      businessName: dto.businessName ?? existing.businessName,
    });
    logger.info(`[Vendor] Profile updated`, { userId });
    return updated;
  }

  async updateStatus(userId: string, status: VendorStatusType): Promise<VendorProfileEntity> {
    await this.getProfile(userId); // auto-creates profile if not yet set up
    const updated = await this.vendorRepository.updateStatus(userId, status);
    logger.info(`[Vendor] Status updated to ${status}`, { userId });
    return updated;
  }
}
