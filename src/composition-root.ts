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
import { InventoryRepository } from '@/modules/inventory/inventory.repository';
import { InventoryService } from '@/modules/inventory/inventory.service';
import { CartRepository, CartService } from '@/modules/cart';
import { CheckoutService } from '@/modules/checkout';
import { OrderRepository, OrderService } from '@/modules/order';
import { VendorOrderRepository, VendorOrderService } from '@/modules/vendor-order';

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
  public readonly inventoryRepository: InventoryRepository;
  public readonly inventoryService: InventoryService;
  public readonly cartRepository: CartRepository;
  public readonly cartService: CartService;
  public readonly checkoutService: CheckoutService;
  public readonly orderRepository: OrderRepository;
  public readonly orderService: OrderService;
  public readonly vendorOrderRepository: VendorOrderRepository;
  public readonly vendorOrderService: VendorOrderService;

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

    // Variant & inventory tracking
    this.inventoryRepository = new InventoryRepository(prisma);
    this.inventoryService = new InventoryService(this.inventoryRepository, this.productRepository);

    // Shopping cart management
    this.cartRepository = new CartRepository(prisma);
    this.cartService = new CartService(this.cartRepository, this.customerRepository);

    // Checkout validation & order preview
    this.checkoutService = new CheckoutService(this.cartRepository, this.customerRepository);

    // Order creation & management
    this.orderRepository = new OrderRepository(prisma);
    this.orderService = new OrderService(this.orderRepository, this.cartRepository, this.customerRepository);

    // Vendor order inbox & state management
    this.vendorOrderRepository = new VendorOrderRepository(prisma);
    this.vendorOrderService = new VendorOrderService(this.vendorOrderRepository, this.vendorRepository);

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
