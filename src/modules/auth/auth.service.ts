import bcrypt from 'bcryptjs';
import type { IAuthService, IAuthRepository } from './auth.contracts';
import type { ITokenService } from './auth.contracts';
import type { RegisterCustomerDto, RegisterVendorDto, LoginDto, AuthResponseDto, TokenResponseDto } from './auth.dto';
import { ConflictError, UnauthorizedError, ForbiddenError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger/logger';

// ─────────────────────────────────────────────────────────────
// Auth Service — Business logic / use case orchestration
// Does NOT touch the database directly. Uses repository contract.
// ─────────────────────────────────────────────────────────────

const SALT_ROUNDS = 12;

export class AuthService implements IAuthService {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly tokenService: ITokenService & { getRefreshTokenExpiryDate(): Date }
  ) {}

  async registerCustomer(dto: RegisterCustomerDto): Promise<AuthResponseDto> {
    return this.registerUser({ ...dto, role: 'CUSTOMER' });
  }

  async registerVendor(dto: RegisterVendorDto): Promise<AuthResponseDto> {
    return this.registerUser({ ...dto, role: 'VENDOR' });
  }

  private async registerUser(data: {
    email: string;
    phone?: string;
    password: string;
    role: 'CUSTOMER' | 'VENDOR';
  }): Promise<AuthResponseDto> {
    const existing = await this.authRepository.findUserByEmail(data.email);

    if (existing) {
      if (existing.roles.includes(data.role)) {
        throw new ConflictError(`An account with this email is already registered as a ${data.role.toLowerCase()}`);
      }

      // User exists with the other role — verify password before adding the new role
      const isValidPassword = await bcrypt.compare(data.password, existing.passwordHash);
      if (!isValidPassword) {
        throw new UnauthorizedError('Incorrect password for existing account');
      }

      const updatedUser = await this.authRepository.addRoleToUser(existing.id, data.role);
      const tokens = await this.tokenService.generateTokenPair(updatedUser.id, updatedUser.email, data.role);
      await this.authRepository.saveRefreshToken(
        updatedUser.id,
        tokens.refreshToken,
        this.tokenService.getRefreshTokenExpiryDate()
      );

      logger.info(`[Auth] Added ${data.role} role to existing user`, { userId: updatedUser.id });

      return {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          phone: updatedUser.phone,
          roles: updatedUser.roles,
          activeRole: data.role,
          status: updatedUser.status,
          emailVerified: updatedUser.emailVerified,
        },
        tokens,
      };
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = await this.authRepository.createUser({
      email: data.email,
      phone: data.phone,
      passwordHash,
      role: data.role,
    });

    const tokens = await this.tokenService.generateTokenPair(user.id, user.email, data.role);
    await this.authRepository.saveRefreshToken(
      user.id,
      tokens.refreshToken,
      this.tokenService.getRefreshTokenExpiryDate()
    );

    logger.info(`[Auth] ${data.role} registered`, { userId: user.id });

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        roles: user.roles,
        activeRole: data.role,
        status: user.status,
        emailVerified: user.emailVerified,
      },
      tokens,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status === 'SUSPENDED') {
      throw new ForbiddenError('Your account has been suspended');
    }

    if (user.status === 'INACTIVE') {
      throw new ForbiddenError('Your account is inactive');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Dual-role user — issue selection token for Phase 2
    if (user.roles.length > 1) {
      const selectionToken = await this.tokenService.generateSelectionToken(user.id, user.email);
      logger.info(`[Auth] User has multiple roles, generated selection token`, { userId: user.id, roles: user.roles });
      return {
        requiresRoleSelection: true,
        availableRoles: user.roles,
        selectionToken,
      };
    }

    // Single-role user — direct login
    const activeRole = user.roles[0];
    const tokens = await this.tokenService.generateTokenPair(user.id, user.email, activeRole);
    await this.authRepository.saveRefreshToken(
      user.id,
      tokens.refreshToken,
      this.tokenService.getRefreshTokenExpiryDate()
    );

    logger.info(`[Auth] User logged in directly`, { userId: user.id, activeRole });

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        roles: user.roles,
        activeRole,
        status: user.status,
        emailVerified: user.emailVerified,
      },
      tokens,
    };
  }

  async selectRole(dto: { selectionToken: string; role: 'CUSTOMER' | 'VENDOR' }): Promise<AuthResponseDto> {
    const { sub: userId } = await this.tokenService.verifySelectionToken(dto.selectionToken);

    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedError('User identity not found');
    }

    if (user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      throw new ForbiddenError('Account is not active');
    }

    if (!user.roles.includes(dto.role)) {
      throw new ForbiddenError(`Your account is not registered as a ${dto.role.toLowerCase()}`);
    }

    const tokens = await this.tokenService.generateTokenPair(user.id, user.email, dto.role);
    await this.authRepository.saveRefreshToken(
      user.id,
      tokens.refreshToken,
      this.tokenService.getRefreshTokenExpiryDate()
    );

    logger.info(`[Auth] User selected role`, { userId: user.id, selectedRole: dto.role });

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        roles: user.roles,
        activeRole: dto.role,
        status: user.status,
        emailVerified: user.emailVerified,
      },
      tokens,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.authRepository.deleteRefreshToken(refreshToken);
    logger.info('[Auth] User logged out');
  }

  async refreshTokens(refreshToken: string): Promise<TokenResponseDto> {
    const record = await this.authRepository.findRefreshToken(refreshToken);
    if (!record) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (record.expiresAt < new Date()) {
      await this.authRepository.deleteRefreshToken(refreshToken);
      throw new UnauthorizedError('Refresh token has expired, please login again');
    }

    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    const user = await this.authRepository.findUserById(record.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Rotate refresh token — preserve active role from payload
    await this.authRepository.deleteRefreshToken(refreshToken);
    const tokens = await this.tokenService.generateTokenPair(user.id, user.email, payload.role);
    await this.authRepository.saveRefreshToken(
      user.id,
      tokens.refreshToken,
      this.tokenService.getRefreshTokenExpiryDate()
    );

    return tokens;
  }

  async verifyAccessToken(token: string): Promise<{ userId: string; role: string }> {
    const payload = await this.tokenService.verifyAccessToken(token);
    return { userId: payload.sub, role: payload.role };
  }
}
