import { prisma } from '../src/lib/db/prisma';

async function checkData() {
  console.log('🔍 Checking DB Vendors & Fetching DummyJSON Products...');
  
  const vendors = await prisma.vendorProfile.findMany();
  console.log(`📊 Found ${vendors.length} Vendors in DB:`);
  vendors.forEach((v) => {
    console.log(`   - ID: ${v.id} | Name: ${v.businessName} | Status: ${v.status} | UserId: ${v.userId}`);
  });

  const users = await prisma.user.findMany({
    select: { id: true, email: true, roles: true, status: true },
  });
  console.log(`\n👥 Found ${users.length} Users in DB.`);

  try {
    const res = await fetch('https://dummyjson.com/products?limit=0');
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const data = await res.json();
    console.log(`\n📦 DummyJSON Response: Total = ${data.total}, Products Array Length = ${data.products?.length}`);
    if (data.products && data.products.length > 0) {
      console.log('\nSample Product [0]:', JSON.stringify(data.products[0], null, 2));
      const categories = Array.from(new Set(data.products.map((p: any) => p.category)));
      console.log(`\n🏷️ Unique Categories (${categories.length}):`, categories);
      const brands = Array.from(new Set(data.products.map((p: any) => p.brand).filter(Boolean)));
      console.log(`\n🏷️ Unique Brands (${brands.length}):`, brands.slice(0, 10), '...');
    }
  } catch (err) {
    console.error('❌ Failed to fetch DummyJSON:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
