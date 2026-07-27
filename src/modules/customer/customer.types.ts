// ─────────────────────────────────────────────────────────────
// Customer Module — Domain Types & Interfaces
// ─────────────────────────────────────────────────────────────

export interface CustomerProfileEntity {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  profileImage: string | null;
}

export interface AddressEntity {
  id: string;
  userId: string;
  label: string | null;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
