import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSecurityLinterWarnings() {
  console.log('🔒 Remediating Supabase Security Linter Warnings for public.rls_auto_enable()...');

  try {
    // 1. Revoke EXECUTE permission on rls_auto_enable from PUBLIC, anon, and authenticated roles
    await prisma.$executeRawUnsafe(`
      REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
    `);
    console.log('✅ Revoked EXECUTE privileges on public.rls_auto_enable() from anon and authenticated roles.');

    // 2. Explicitly GRANT EXECUTE only to service_role and postgres superuser
    await prisma.$executeRawUnsafe(`
      GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO service_role, postgres;
    `);
    console.log('✅ Granted EXECUTE privileges on public.rls_auto_enable() exclusively to service_role and postgres.');

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixSecurityLinterWarnings();
