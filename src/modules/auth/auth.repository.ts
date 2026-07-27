import type { PrismaClient } from '@prisma/client';
import type { IAuthRepository } from './auth.contracts';
import type { AuthUser } from './auth.types';

// ─────────────────────────────────────────────────────────────
// Auth Repository — PostgreSQL/Prisma implementation
// Responsible ONLY for persistence. No business logic here.
// ─────────────────────────────────────────────────────────────

export class AuthRepository implements IAuthRepository {
  constructor(private readonly db: PrismaClient) {}

  async findUserByEmail(email: string): Promise<(AuthUser & { passwordHash: string }) | null> {
    const user = await this.db.user.findUnique({ where: { email } });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      roles: user.roles,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findUserById(id: string): Promise<AuthUser | null> {
    const user = await this.db.user.findUnique({ where: { id } });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      roles: user.roles,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async createUser(data: {
    email: string;
    phone?: string;
    passwordHash: string;
    role: 'CUSTOMER' | 'VENDOR';
  }): Promise<AuthUser> {
    const user = await this.db.user.create({
      data: {
        email: data.email,
        phone: data.phone ?? null,
        passwordHash: data.passwordHash,
        roles: [data.role],
        status: 'ACTIVE',
      },
    });
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      roles: user.roles,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async addRoleToUser(userId: string, role: 'CUSTOMER' | 'VENDOR'): Promise<AuthUser> {
    const existing = await this.db.user.findUnique({ where: { id: userId } });
    if (!existing) throw new Error('User not found');

    const updatedRoles = existing.roles.includes(role) ? existing.roles : [...existing.roles, role];

    const user = await this.db.user.update({
      where: { id: userId },
      data: { roles: updatedRoles },
    });

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      roles: user.roles,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await this.db.refreshToken.create({ data: { token, userId, expiresAt } });
  }

  async findRefreshToken(token: string): Promise<{ userId: string; expiresAt: Date } | null> {
    const record = await this.db.refreshToken.findUnique({ where: { token } });
    if (!record) return null;
    return { userId: record.userId, expiresAt: record.expiresAt };
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await this.db.refreshToken.deleteMany({ where: { token } });
  }

  async deleteAllRefreshTokens(userId: string): Promise<void> {
    await this.db.refreshToken.deleteMany({ where: { userId } });
  }
}
