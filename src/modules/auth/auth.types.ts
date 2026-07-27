// ─────────────────────────────────────────────────────────────
// Auth Module — Domain Types
// ─────────────────────────────────────────────────────────────

export type UserRole = 'CUSTOMER' | 'VENDOR';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface AuthUser {
  id: string;
  email: string;
  phone: string | null;
  roles: UserRole[];
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;       // userId
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
