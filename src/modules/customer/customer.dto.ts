// ─────────────────────────────────────────────────────────────
// Customer Module — DTOs (Data Transfer Objects)
// ─────────────────────────────────────────────────────────────

export interface UpdateCustomerProfileDto {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  profileImage?: string;
}

export interface CreateAddressDto {
  label?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
}

export interface UpdateAddressDto {
  label?: string;
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}
