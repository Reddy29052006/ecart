import type { VendorStatusType } from './vendor.types';

// ─────────────────────────────────────────────────────────────
// Vendor Module — DTOs (Data Transfer Objects)
// ─────────────────────────────────────────────────────────────

export interface UpdateVendorProfileDto {
  businessName?: string;
  businessDescription?: string;
  businessPhone?: string;
  businessEmail?: string;
  logo?: string;
}

export interface UpdateVendorStatusDto {
  status: VendorStatusType;
}
