import { SignJWT, jwtVerify } from 'jose';
import { env } from '@/config/env';
import type { ITokenService } from '@/modules/auth/auth.contracts';
import type { TokenPair } from '@/modules/auth/auth.types';
import { UnauthorizedError } from '@/lib/errors/app-error';

// Token Service — JWT access + refresh token operations

export class TokenService implements ITokenService {
  private readonly accessSecret: Uint8Array;
  private readonly refreshSecret: Uint8Array;
  private readonly accessExpiresIn = '15m';
  private readonly refreshExpiresIn = 60 * 60 * 24 * 7; // 7 days in seconds

  constructor() {
    this.accessSecret = new TextEncoder().encode(env.JWT_SECRET);
    this.refreshSecret = new TextEncoder().encode(env.JWT_SECRET + '_refresh');
  }

  async generateTokenPair(userId: string, email: string, role: string): Promise<TokenPair> {
    const now = Math.floor(Date.now() / 1000);

    const accessToken = await new SignJWT({ email, role })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(userId)
      .setIssuedAt(now)
      .setExpirationTime(`${this.accessExpiresIn}`)
      .sign(this.accessSecret);

    const refreshToken = await new SignJWT({ email, role })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(userId)
      .setIssuedAt(now)
      .setExpirationTime(now + this.refreshExpiresIn)
      .sign(this.refreshSecret);

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<{ sub: string; email: string; role: string }> {
    try {
      const { payload } = await jwtVerify(token, this.accessSecret);
      return {
        sub: payload.sub as string,
        email: payload['email'] as string,
        role: payload['role'] as string,
      };
    } catch {
      throw new UnauthorizedError('Invalid or expired access token');
    }
  }

  async verifyRefreshToken(token: string): Promise<{ sub: string; email: string; role: string }> {
    try {
      const { payload } = await jwtVerify(token, this.refreshSecret);
      return {
        sub: payload.sub as string,
        email: payload['email'] as string,
        role: payload['role'] as string,
      };
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async generateSelectionToken(userId: string, email: string): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    return new SignJWT({ email, type: 'role_selection' })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(userId)
      .setIssuedAt(now)
      .setExpirationTime('5m') // Short-lived single purpose selection token
      .sign(this.accessSecret);
  }

  async verifySelectionToken(token: string): Promise<{ sub: string; email: string }> {
    try {
      const { payload } = await jwtVerify(token, this.accessSecret);
      if (payload['type'] !== 'role_selection') {
        throw new UnauthorizedError('Invalid token type for role selection');
      }
      return {
        sub: payload.sub as string,
        email: payload['email'] as string,
      };
    } catch {
      throw new UnauthorizedError('Invalid or expired selection token');
    }
  }

  getRefreshTokenExpiryDate(): Date {
    return new Date(Date.now() + this.refreshExpiresIn * 1000);
  }
}
