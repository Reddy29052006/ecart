import type { NextRequest } from 'next/server';
import { TooManyRequestsError } from '@/lib/errors/app-error';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private hits = new Map<string, RateLimitRecord>();

  public check(request: NextRequest, maxRequests = 10, windowMs = 60 * 1000): void {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    const now = Date.now();
    const record = this.hits.get(ip);

    if (!record || now > record.resetAt) {
      this.hits.set(ip, { count: 1, resetAt: now + windowMs });
      return;
    }

    if (record.count >= maxRequests) {
      throw new TooManyRequestsError('Too many requests, please try again later');
    }

    record.count += 1;
  }

  public reset(): void {
    this.hits.clear();
  }
}

export const rateLimiter = new RateLimiter();
