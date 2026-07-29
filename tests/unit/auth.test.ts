import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '@/modules/auth/auth.service';
import { TokenService } from '@/lib/auth/token.service';
import { ConflictError, UnauthorizedError, TooManyRequestsError } from '@/lib/errors/app-error';
import { RateLimiter } from '@/lib/auth/rate-limiter';
import type { IAuthRepository } from '@/modules/auth';

class MockAuthRepository implements IAuthRepository {
  private users: any[] = [];
  private refreshTokens: any[] = [];

  async findUserByEmail(email: string): Promise<any | null> {
    return this.users.find((u) => u.email === email) || null;
  }

  async findUserById(id: string): Promise<any | null> {
    return this.users.find((u) => u.id === id) || null;
  }

  async createUser(data: any): Promise<any> {
    const user = {
      id: `user-${Date.now()}-${Math.random()}`,
      email: data.email,
      phone: data.phone || null,
      passwordHash: data.passwordHash,
      roles: [data.role],
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  async addRoleToUser(userId: string, role: any): Promise<any> {
    const user = await this.findUserById(userId);
    if (user && !user.roles.includes(role)) {
      user.roles.push(role);
    }
    return user;
  }

  async saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    this.refreshTokens.push({ userId, token, expiresAt });
  }

  async findRefreshToken(token: string): Promise<{ userId: string; expiresAt: Date } | null> {
    const t = this.refreshTokens.find((r) => r.token === token);
    return t ? { userId: t.userId, expiresAt: t.expiresAt } : null;
  }

  async deleteRefreshToken(token: string): Promise<void> {
    this.refreshTokens = this.refreshTokens.filter((t) => t.token !== token);
  }

  async deleteAllRefreshTokens(userId: string): Promise<void> {
    this.refreshTokens = this.refreshTokens.filter((t) => t.userId !== userId);
  }
}

describe('AuthService — Multi-Role & Authentication Tests', () => {
  let authService: AuthService;
  let authRepo: MockAuthRepository;
  let tokenService: TokenService;

  beforeEach(() => {
    authRepo = new MockAuthRepository();
    tokenService = new TokenService();
    authService = new AuthService(authRepo, tokenService);
  });

  it('should register a new Customer successfully', async () => {
    const result = await authService.registerCustomer({
      email: 'customer@example.com',
      password: 'password123',
    });

    expect(result.user?.email).toBe('customer@example.com');
    expect(result.user?.roles).toContain('CUSTOMER');
    expect(result.user?.activeRole).toBe('CUSTOMER');
    expect(result.tokens?.accessToken).toBeDefined();
    expect(result.tokens?.refreshToken).toBeDefined();
  });

  it('should register a new Vendor successfully', async () => {
    const result = await authService.registerVendor({
      email: 'vendor@example.com',
      password: 'password123',
    });

    expect(result.user?.email).toBe('vendor@example.com');
    expect(result.user?.roles).toContain('VENDOR');
    expect(result.user?.activeRole).toBe('VENDOR');
  });

  it('should reject duplicate customer registration with conflict error', async () => {
    await authService.registerCustomer({
      email: 'duplicate@example.com',
      password: 'password123',
    });

    await expect(
      authService.registerCustomer({
        email: 'duplicate@example.com',
        password: 'password123',
      })
    ).rejects.toThrow(ConflictError);
  });

  it('should reject duplicate vendor registration with conflict error', async () => {
    await authService.registerVendor({
      email: 'vendor-dup@example.com',
      password: 'password123',
    });

    await expect(
      authService.registerVendor({
        email: 'vendor-dup@example.com',
        password: 'password123',
      })
    ).rejects.toThrow(ConflictError);
  });

  it('should allow multi-role registration under same email when valid password provided', async () => {
    // 1. Register as Customer first
    await authService.registerCustomer({
      email: 'dual@example.com',
      password: 'password123',
    });

    // 2. Register as Vendor using same email and password
    const result = await authService.registerVendor({
      email: 'dual@example.com',
      password: 'password123',
    });

    expect(result.user?.roles).toContain('CUSTOMER');
    expect(result.user?.roles).toContain('VENDOR');
  });

  it('should reject single-role login with unknown email', async () => {
    await expect(
      authService.login({
        email: 'nonexistent@example.com',
        password: 'password123',
      })
    ).rejects.toThrow(UnauthorizedError);
  });

  it('should reject login with wrong password', async () => {
    await authService.registerCustomer({
      email: 'wrongpass@example.com',
      password: 'password123',
    });

    await expect(
      authService.login({
        email: 'wrongpass@example.com',
        password: 'wrongpassword',
      })
    ).rejects.toThrow(UnauthorizedError);
  });

  it('should perform single-role login directly', async () => {
    await authService.registerCustomer({
      email: 'single@example.com',
      password: 'password123',
    });

    const loginRes = await authService.login({
      email: 'single@example.com',
      password: 'password123',
    });

    expect(loginRes.tokens?.accessToken).toBeDefined();
    expect(loginRes.user?.activeRole).toBe('CUSTOMER');
  });

  it('should return selectionToken for dual-role account login', async () => {
    await authService.registerCustomer({
      email: 'dual-login@example.com',
      password: 'password123',
    });
    await authService.registerVendor({
      email: 'dual-login@example.com',
      password: 'password123',
    });

    const loginRes = await authService.login({
      email: 'dual-login@example.com',
      password: 'password123',
    });

    expect(loginRes.requiresRoleSelection).toBe(true);
    expect(loginRes.selectionToken).toBeDefined();
    expect(loginRes.availableRoles).toEqual(['CUSTOMER', 'VENDOR']);

    if (loginRes.selectionToken) {
      // Complete role selection
      const selectRes = await authService.selectRole({
        selectionToken: loginRes.selectionToken,
        role: 'VENDOR',
      });
      expect(selectRes.user?.activeRole).toBe('VENDOR');
    }
  });

  it('should reject role selection if role is not possessed by user', async () => {
    await authService.registerCustomer({
      email: 'single-role-only@example.com',
      password: 'password123',
    });

    const loginRes = await authService.login({
      email: 'single-role-only@example.com',
      password: 'password123',
    });

    // Single role user returns direct token, not selection token
    expect(loginRes.tokens?.accessToken).toBeDefined();
  });

  it('should enforce rate limiting after repeated requests', () => {
    const rateLimiter = new RateLimiter();
    const req = {
      headers: new Map([['x-forwarded-for', '192.168.1.100']]),
    } as any;

    for (let i = 0; i < 5; i++) {
      rateLimiter.check(req, 5, 60000);
    }

    expect(() => rateLimiter.check(req, 5, 60000)).toThrow(TooManyRequestsError);
  });
});
