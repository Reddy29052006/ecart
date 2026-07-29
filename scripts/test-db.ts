import { prisma } from '../src/lib/db/prisma';

async function checkDatabase() {
  console.log('🔍 Testing connection to Supabase PostgreSQL database...');
  const start = Date.now();
  try {
    // 1. Raw query test
    const result: any[] = await prisma.$queryRaw`SELECT 1 as connected, current_database(), version()`;
    console.log('✅ Connection Successful!');
    console.log('   Database Name:', result[0]?.current_database);
    console.log('   PostgreSQL Version:', result[0]?.version?.split(' ')?.[0] || result[0]?.version);

    // 2. Query application table counts
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();
    const cartCount = await prisma.cart.count();

    console.log('\n📊 Table Row Counts:');
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Products: ${productCount}`);
    console.log(`   - Categories: ${categoryCount}`);
    console.log(`   - Carts: ${cartCount}`);

    // 3. Check RLS status on public tables
    const rlsStatus: any[] = await prisma.$queryRaw`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    console.log('\n🔒 RLS Status on Public Schema Tables:');
    for (const row of rlsStatus) {
      console.log(`   - ${row.tablename.padEnd(25)} : ${row.rowsecurity ? 'RLS ENABLED ✅' : 'RLS DISABLED ❌'}`);
    }

    console.log(`\n⏱️ Total Response Time: ${Date.now() - start}ms`);
  } catch (error) {
    console.error('❌ Database Connection Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
