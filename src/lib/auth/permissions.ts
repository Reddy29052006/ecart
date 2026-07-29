import type { NextRequest } from 'next/server';
import { TokenService } from './token.service';
import { UnauthorizedError, ForbiddenError } from '@/lib/errors/app-error';

// Auth Middleware / Request Helpers
// Extracts and validates the current authenticated user.

const tokenService = new TokenService();

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
}

/**
 * Extracts the Bearer token from Authorization header and verifies it.
 * Returns the authenticated user context.
 */
export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid Authorization header');
  }

  const token = authHeader.slice(7);
  const payload = await tokenService.verifyAccessToken(token);

  return {
    userId: payload.sub,
    email: payload.email,
    role: payload.role,
  };
}

/**
 * Requires the user to have a specific role.
 */
export async function requireRole(
  request: NextRequest,
  role: 'CUSTOMER' | 'VENDOR'
): Promise<AuthenticatedUser> {
  const user = await requireAuth(request);
  if (user.role !== role) {
    throw new ForbiddenError(`Access restricted to ${role} accounts`);
  }
  return user;
}

/**
 * Requires administrative authorization.
 * Checks for valid admin secret header or admin token capability.
 */
export async function requireAdmin(request: NextRequest): Promise<{ isAdmin: boolean }> {
  const adminSecretHeader = request.headers.get('x-admin-secret');
  const expectedSecret = process.env.ADMIN_SECRET || 'admin-secret-key';

  if (adminSecretHeader && adminSecretHeader === expectedSecret) {
    return { isAdmin: true };
  }

  // Also check if request carries an authenticated token with ADMIN role capability
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const payload = await tokenService.verifyAccessToken(token);
      if (payload.role === 'ADMIN') {
        return { isAdmin: true };
      }
    } catch {
      // Fall through to throw ForbiddenError below
    }
  }

  throw new ForbiddenError('Administrative privileges required');
}

