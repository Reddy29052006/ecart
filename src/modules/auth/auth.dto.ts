// ─────────────────────────────────────────────────────────────
// Auth Module — DTOs (Data Transfer Objects)
// These are the shapes at API boundaries — NOT Prisma models.
// ─────────────────────────────────────────────────────────────

export interface RegisterCustomerDto {
  email: string;
  phone?: string;
  password: string;
}

export interface RegisterVendorDto {
  email: string;
  phone?: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface SelectRoleDto {
  selectionToken: string;
  role: 'CUSTOMER' | 'VENDOR';
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface AuthResponseDto {
  user?: {
    id: string;
    email: string;
    phone: string | null;
    roles: string[];
    activeRole?: string;
    status: string;
    emailVerified: boolean;
  };
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  requiresRoleSelection?: boolean;
  availableRoles?: string[];
  selectionToken?: string;
}

export interface TokenResponseDto {
  accessToken: string;
  refreshToken: string;
}
