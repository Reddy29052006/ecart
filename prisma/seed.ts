import { prisma } from '../src/lib/db/prisma';

async function main() {
  console.log('🌱 Starting database seed...');
  // Seed initial data as domain models are added in future stages
  console.log('✅ Base seed executed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Database seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
