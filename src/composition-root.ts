import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger/logger';
import { AuthRepository } from '@/modules/auth/auth.repository';
import { AuthService } from '@/modules/auth/auth.service';
import { TokenService } from '@/lib/auth/token.service';
import { CustomerRepository } from '@/modules/customer/customer.repository';
import { CustomerService } from '@/modules/customer/customer.service';
import { VendorRepository } from '@/modules/vendor/vendor.repository';
import { VendorService } from '@/modules/vendor/vendor.service';

import { CategoryRepository } from '@/modules/catalog/category.repository';
import { CategoryService } from '@/modules/catalog/category.service';
import { ProductRepository } from '@/modules/catalog/product.repository';
import { ProductService } from '@/modules/catalog/product.service';

// Main dependency injection container that hooks up all repositories and services across modules
export class CompositionRoot {
  private static instance: CompositionRoot;

  public readonly tokenService: TokenService;
  public readonly authRepository: AuthRepository;
  public readonly authService: AuthService;
  public readonly customerRepository: CustomerRepository;
  public readonly customerService: CustomerService;
  public readonly vendorRepository: VendorRepository;
  public readonly vendorService: VendorService;
  public readonly categoryRepository: CategoryRepository;
  public readonly categoryService: CategoryService;
  public readonly productRepository: ProductRepository;
  public readonly productService: ProductService;

  private constructor() {
    // Shared authentication & token helpers
    this.tokenService = new TokenService();

    // User authentication & role management
    this.authRepository = new AuthRepository(prisma);
    this.authService = new AuthService(this.authRepository, this.tokenService);

    // Customer profile & delivery address management
    this.customerRepository = new CustomerRepository(prisma);
    this.customerService = new CustomerService(this.customerRepository);

    // Vendor store profile & onboarding status
    this.vendorRepository = new VendorRepository(prisma);
    this.vendorService = new VendorService(this.vendorRepository);

    // Product catalog & category management
    this.categoryRepository = new CategoryRepository(prisma);
    this.categoryService = new CategoryService(this.categoryRepository);
    this.productRepository = new ProductRepository(prisma);
    this.productService = new ProductService(this.productRepository, this.categoryRepository);

    logger.info('Dependency container initialized successfully.');
  }

  public static getInstance(): CompositionRoot {
    if (!CompositionRoot.instance) {
      CompositionRoot.instance = new CompositionRoot();
    }
    return CompositionRoot.instance;
  }

  public getPrisma() {
    return prisma;
  }
}

export const container = CompositionRoot.getInstance();
