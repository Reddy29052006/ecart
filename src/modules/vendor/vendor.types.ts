// ─────────────────────────────────────────────────────────────
// Vendor Module — Domain Types & Interfaces
// ─────────────────────────────────────────────────────────────

export type VendorStatusType = 'PENDING' | 'ACTIVE' | 'SUSPENDED';

export interface VendorProfileEntity {
  id: string;
  userId: string;
  businessName: string;
  businessDescription: string | null;
  businessPhone: string | null;
  businessEmail: string | null;
  logo: string | null;
  status: VendorStatusType;
  createdAt: Date;
  updatedAt: Date;
}
