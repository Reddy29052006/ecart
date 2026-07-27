// ─────────────────────────────────────────────────────────────
// Auth Module — Contracts (Interfaces)
// These define what the module NEEDS and PROVIDES.
// Implementations must satisfy these contracts.
// ─────────────────────────────────────────────────────────────

import type { AuthUser, TokenPair } from './auth.types';
import type {
  RegisterCustomerDto,
  RegisterVendorDto,
  LoginDto,
  SelectRoleDto,
  AuthResponseDto,
  TokenResponseDto,
} from './auth.dto';

// ── Repository Contract ──────────────────────────────────────

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<AuthUser & { passwordHash: string } | null>;
  findUserById(id: string): Promise<AuthUser | null>;
  createUser(data: {
    email: string;
    phone?: string;
    passwordHash: string;
    role: 'CUSTOMER' | 'VENDOR';
  }): Promise<AuthUser>;
  addRoleToUser(userId: string, role: 'CUSTOMER' | 'VENDOR'): Promise<AuthUser>;
  saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  findRefreshToken(token: string): Promise<{ userId: string; expiresAt: Date } | null>;
  deleteRefreshToken(token: string): Promise<void>;
  deleteAllRefreshTokens(userId: string): Promise<void>;
}

// ── Service Contract ─────────────────────────────────────────

export interface IAuthService {
  registerCustomer(dto: RegisterCustomerDto): Promise<AuthResponseDto>;
  registerVendor(dto: RegisterVendorDto): Promise<AuthResponseDto>;
  login(dto: LoginDto): Promise<AuthResponseDto>;
  selectRole(dto: SelectRoleDto): Promise<AuthResponseDto>;
  logout(refreshToken: string): Promise<void>;
  refreshTokens(refreshToken: string): Promise<TokenResponseDto>;
  verifyAccessToken(token: string): Promise<{ userId: string; role: string }>;
}

// ── Token Service Contract ───────────────────────────────────

export interface ITokenService {
  generateTokenPair(userId: string, email: string, role: string): Promise<TokenPair>;
  generateSelectionToken(userId: string, email: string): Promise<string>;
  verifyAccessToken(token: string): Promise<{ sub: string; email: string; role: string }>;
  verifyRefreshToken(token: string): Promise<{ sub: string; email: string; role: string }>;
  verifySelectionToken(token: string): Promise<{ sub: string; email: string }>;
}
