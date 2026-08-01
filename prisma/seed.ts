import { PrismaClient, UserRole, UserStatus, VendorStatus, ProductStatus, VariantStatus, MovementType } from '@prisma/client';
import bcrypt from 'bcryptjs';

let prisma = new PrismaClient();

interface DummyProduct {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
  sku: string;
  weight: number;
  dimensions: { width: number; height: number; depth: number };
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: { createdAt: string; updatedAt: string; barcode: string; qrCode: string };
  images: string[];
  thumbnail: string;
}

interface DummyJSONResponse {
  products: DummyProduct[];
  total: number;
  skip: number;
  limit: number;
}

function formatCategoryName(categorySlug: string): string {
  return categorySlug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function generateSlug(name: string, id: number): string {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-');
  return `${baseSlug}-${id}`;
}

async function ensureDbConnected(retries = 5, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔌 Connecting to database (Attempt ${attempt}/${retries})...`);
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Connection established successfully.');
      return;
    } catch (err: any) {
      console.warn(`⚠️ DB connection attempt ${attempt} failed: ${err?.message || err}. Re-initializing client in ${delayMs / 1000}s...`);
      await prisma.$disconnect().catch(() => {});
      prisma = new PrismaClient();
      if (attempt === retries) throw err;
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
}

async function fetchWithRetry(url: string, retries = 5, delayMs = 3000): Promise<DummyJSONResponse> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📥 Fetching dataset from ${url} (Attempt ${attempt}/${retries})...`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      return (await response.json()) as DummyJSONResponse;
    } catch (err: any) {
      console.warn(`⚠️ Fetch attempt ${attempt} failed: ${err?.message || err}. Retrying in ${delayMs / 1000}s...`);
      if (attempt === retries) throw err;
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  throw new Error('Failed to fetch dataset after maximum retries');
}

async function runDbWithRetry<T>(operationName: string, fn: () => Promise<T>, retries = 5, delayMs = 3000): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      console.warn(`⚠️ DB Operation "${operationName}" (Attempt ${attempt}/${retries}) failed: ${err?.message || err}. Reconnecting...`);
      await prisma.$disconnect().catch(() => {});
      prisma = new PrismaClient();
      await prisma.$connect().catch(() => {});
      if (attempt === retries) throw err;
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  throw new Error(`DB operation "${operationName}" failed after max retries.`);
}

export async function seedDummyJSON() {
  console.log('🚀 Starting Resilient Database Reset & DummyJSON Import...');
  const startTime = Date.now();

  // 0. ENSURE DB CONNECTION
  await ensureDbConnected();

  // 1. COMPLETE PURGE OF ALL DATABASE TABLES (Atomic TRUNCATE CASCADE)
  console.log('🧹 Purging ALL existing database records...');
  await runDbWithRetry('Purge Database Tables', async () => {
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE 
        order_status_history, 
        vendor_order_status_history, 
        order_items, 
        vendor_orders, 
        orders, 
        cart_items, 
        carts, 
        inventory_movements, 
        inventory, 
        variant_attributes, 
        product_variants, 
        product_images, 
        products, 
        categories, 
        addresses, 
        refresh_tokens, 
        customer_profiles, 
        vendor_profiles, 
        users 
      CASCADE;
    `);
  });
  console.log('✅ Database completely cleared via TRUNCATE CASCADE.');

  // 2. CREATE PRIMARY VENDOR ACCOUNT (reddy@gmail.com / Reddy@2905)
  console.log('👤 Creating primary Vendor account (reddy@gmail.com)...');
  const passwordHash = await bcrypt.hash('Reddy@2905', 12);

  await runDbWithRetry('Create Vendor User', async () => {
    return await prisma.user.create({
      data: {
        email: 'reddy@gmail.com',
        phone: '+919876543210',
        passwordHash,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        phoneVerified: true,
        roles: [UserRole.VENDOR, UserRole.CUSTOMER],
        vendorProfile: {
          create: {
            businessName: 'Reddy Enterprise',
            businessDescription: 'Official Reddy Storefront for Premium Artisan & General Goods',
            businessPhone: '+919876543210',
            businessEmail: 'reddy@gmail.com',
            status: VendorStatus.ACTIVE,
          },
        },
        customerProfile: {
          create: {
            firstName: 'Reddy',
            lastName: 'Sekhar',
            displayName: 'Reddy Sekhar',
          },
        },
      },
    });
  });

  const vendorProfile = await runDbWithRetry('Get Vendor Profile', async () => {
    return await prisma.vendorProfile.findFirst({
      where: { user: { email: 'reddy@gmail.com' } },
    });
  });

  if (!vendorProfile) {
    throw new Error('Failed to retrieve Vendor Profile for reddy@gmail.com');
  }
  console.log(`✅ Primary Vendor confirmed: reddy@gmail.com (Vendor ID: ${vendorProfile.id})`);

  // 3. FETCH DUMMYJSON DATASET
  const json = await fetchWithRetry('https://dummyjson.com/products?limit=0');
  const dummyProducts = json.products || [];
  console.log(`✅ Downloaded ${dummyProducts.length} products.`);

  if (dummyProducts.length === 0) {
    throw new Error('No products received from DummyJSON API.');
  }

  // 4. CREATE CATEGORIES
  console.log('🏷️ Processing unique categories...');
  const categoryMap = new Map<string, string>();
  const uniqueCategorySlugs = Array.from(new Set(dummyProducts.map((p) => p.category)));

  for (const catSlug of uniqueCategorySlugs) {
    const categoryName = formatCategoryName(catSlug);
    const category = await runDbWithRetry(`Create Category ${catSlug}`, async () => {
      return await prisma.category.create({
        data: {
          name: categoryName,
          slug: catSlug,
          description: `Official catalog category for ${categoryName}`,
        },
      });
    });
    categoryMap.set(catSlug, category.id);
  }
  console.log(`✅ Created ${categoryMap.size} categories.`);

  // 5. IMPORT PRODUCTS WITH NESTED RELATIONS
  console.log('📦 Importing 194 products into Reddy Enterprise catalog...');
  let importedCount = 0;
  let imageCount = 0;
  let variantCount = 0;
  const brandSet = new Set<string>();

  for (const item of dummyProducts) {
    const categoryId = categoryMap.get(item.category);
    if (!categoryId) {
      continue;
    }

    if (item.brand) {
      brandSet.add(item.brand);
    }

    const productSlug = generateSlug(item.title, item.id);

    // Build Product Images List
    const imagesToCreate: Array<{ url: string; sortOrder: number; isPrimary: boolean }> = [];
    if (item.thumbnail) {
      imagesToCreate.push({
        url: item.thumbnail,
        sortOrder: 0,
        isPrimary: true,
      });
      imageCount++;
    }

    if (Array.isArray(item.images)) {
      let sortIdx = 1;
      for (const imgUrl of item.images) {
        if (imgUrl !== item.thumbnail) {
          imagesToCreate.push({
            url: imgUrl,
            sortOrder: sortIdx++,
            isPrimary: false,
          });
          imageCount++;
        }
      }
    }

    // Build Variant Attributes
    const attributesToCreate: Array<{ name: string; value: string }> = [];
    if (item.brand) attributesToCreate.push({ name: 'Brand', value: item.brand });
    if (item.warrantyInformation) attributesToCreate.push({ name: 'Warranty', value: item.warrantyInformation });
    if (item.shippingInformation) attributesToCreate.push({ name: 'Shipping', value: item.shippingInformation });
    if (item.returnPolicy) attributesToCreate.push({ name: 'Return Policy', value: item.returnPolicy });

    const uniqueSku = item.sku ? `${item.sku}-${item.id}` : `SKU-REDDY-${item.id}`;

    // Create Product with nested images, variant, inventory & movements
    await runDbWithRetry(`Create Product ${item.id}`, async () => {
      await prisma.product.create({
        data: {
          vendorId: vendorProfile.id,
          categoryId,
          name: item.title,
          slug: productSlug,
          description: item.description,
          brand: item.brand || null,
          price: item.price,
          stock: item.stock,
          status: ProductStatus.ACTIVE,
          images: {
            create: imagesToCreate,
          },
          variants: {
            create: [
              {
                sku: uniqueSku,
                price: item.price,
                status: VariantStatus.ACTIVE,
                lowStockThreshold: 5,
                attributes: {
                  create: attributesToCreate,
                },
                inventory: {
                  create: {
                    availableQuantity: item.stock,
                    reservedQuantity: 0,
                  },
                },
                movements: {
                  create: [
                    {
                      type: MovementType.STOCK_IN,
                      quantity: item.stock,
                      note: 'Initial import from DummyJSON dataset for Reddy Enterprise',
                    },
                  ],
                },
              },
            ],
          },
        },
      });
    });

    importedCount++;
    variantCount++;
  }

  const durationMs = Date.now() - startTime;
  console.log(`\n🎉 Seed & Database Re-initialization Completed in ${durationMs}ms!`);
  console.log(`📊 SUMMARY OF IMPORT:`);
  console.log(`   - Vendor Account      : reddy@gmail.com (Password: Reddy@2905)`);
  console.log(`   - Vendor Status       : ACTIVE`);
  console.log(`   - Products Imported   : ${importedCount} of ${dummyProducts.length}`);
  console.log(`   - Categories Created  : ${categoryMap.size}`);
  console.log(`   - Brands Represented  : ${brandSet.size}`);
  console.log(`   - Images Imported     : ${imageCount}`);
  console.log(`   - Variants Created    : ${variantCount}`);
  console.log(`   - Inventory Records   : ${importedCount}`);

  return {
    userEmail: 'reddy@gmail.com',
    importedCount,
    categoriesCount: categoryMap.size,
    brandsCount: brandSet.size,
    imageCount,
    variantCount,
  };
}

if (require.main === module) {
  seedDummyJSON()
    .then(() => prisma.$disconnect())
    .catch(async (err) => {
      console.error('❌ Seeding failed:', err);
      await prisma.$disconnect();
      process.exit(1);
    });
}
