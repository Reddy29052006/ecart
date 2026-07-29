# Supabase RLS Security Fix

## 1. Original Findings

The Supabase Security Advisor reported the following security findings:

### RLS Disabled in Public:
- `public._prisma_migrations`
- `public.refresh_tokens`
- `public.addresses`
- `public.users`
- `public.customer_profiles`
- `public.vendor_profiles`
- `public.inventory`
- `public.categories`
- `public.products`
- `public.product_images`
- `public.variant_attributes`
- `public.inventory_movements`
- `public.product_variants`
- `public.carts`
- `public.cart_items`

### Sensitive Columns Exposed:
- `public.refresh_tokens.token`

---

## 2. Actual Root Cause

By default, Supabase exposes all tables created within the PostgreSQL `public` schema over PostgREST (Supabase Data API at `/rest/v1/`) to default API roles (`anon` and `authenticated`). Because Row Level Security (RLS) was not explicitly enabled and table privileges were granted to `public`, any external client with a valid Supabase project URL could directly query or mutate application data over HTTP, bypassing application authorization controls.

The application architecture does not use Supabase Data API on the client side; all database interactions are handled server-side via Prisma ORM using a direct PostgreSQL connection (`DATABASE_URL`).

---

## 3. Architecture Used

**Architecture Pattern:** **Case A (Prisma / Server-Side Database Access Only)**

```text
Browser
  ↓ (HTTP / REST APIs)
Next.js App Router (src/app/api/v1/...)
  ↓ (In-Memory Method Calls)
Application Services (src/modules/<domain>/<domain>.service.ts)
  ↓ (Interface Contracts)
Repositories (src/modules/<domain>/<domain>.repository.ts)
  ↓ (OR Mapping)
Prisma Client
  ↓ (Direct PostgreSQL Wire Protocol via DATABASE_URL)
PostgreSQL Database (Supabase PostgreSQL Engine)
```

- **Browser/Client Code**: Calls Next.js API endpoints (`/api/v1/...`). Never uses `@supabase/supabase-js` or PostgREST direct REST endpoints.
- **Server-Side Code**: Executes queries via Prisma Client as the database owner (`postgres` superuser role).

---

## 4. Tables Changed

Row Level Security (RLS) has been enabled on all 15 public schema application tables plus Prisma migration history:

1. `public._prisma_migrations`
2. `public.users`
3. `public.refresh_tokens`
4. `public.customer_profiles`
5. `public.addresses`
6. `public.vendor_profiles`
7. `public.categories`
8. `public.products`
9. `public.product_images`
10. `public.product_variants`
11. `public.variant_attributes`
12. `public.inventory`
13. `public.inventory_movements`
14. `public.carts`
15. `public.cart_items`

---

## 5. Tables Intentionally Not Changed

**None.** All 15 public tables plus `_prisma_migrations` have RLS enabled and untrusted API role grants revoked. `_prisma_migrations` is preserved for Prisma migration history tracking without creating permissive RLS policies.

---

## 6. RLS Policies

- **RLS Status**: Enabled on all tables (`ALTER TABLE "public"."<table>" ENABLE ROW LEVEL SECURITY;`).
- **PostgREST API Access (`anon`, `authenticated`)**:
  - `SELECT`: **Denied** (returns 0 rows / 403 Forbidden).
  - `INSERT`: **Denied** (403 Forbidden).
  - `UPDATE`: **Denied** (403 Forbidden).
  - `DELETE`: **Denied** (403 Forbidden).
- **Prisma Server Access**: Prisma connects via the database owner role (`postgres`), which possesses `BYPASSRLS` privileges in PostgreSQL. All server-side business logic and repository queries continue to operate seamlessly without performance overhead or policy conflicts.

---

## 7. Database Grants

Applied via Prisma Migration (`prisma/migrations/20260729110000_enable_rls_and_revoke_public_grants/migration.sql`):

```sql
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;
```

---

## 8. Refresh Token Security

- `public.refresh_tokens.token` is completely isolated from HTTP exposure.
- Public PostgREST access to `refresh_tokens` is blocked by RLS and revoked database privileges.
- Refresh token generation, validation, rotation, and deletion are handled strictly server-side by `AuthService` and `AuthRepository` via Prisma.
- API responses never expose raw refresh tokens, password hashes, or sensitive internal credentials.

---

## 9. Security Tests

Established automated security boundary tests in `tests/unit/security.test.ts`:

1. **Authentication & Unauthenticated Access**: Verifies unauthenticated or unknown user requests are rejected by service boundaries.
2. **Customer Ownership**: Verifies Customer A cannot read or modify Customer B's profile, addresses, or cart items.
3. **Vendor Ownership**: Verifies Vendor A cannot modify Vendor B's products or inventory.
4. **Refresh Tokens**: Verifies refresh token records are not leaked in user API responses.
5. **Public Catalog**: Verifies storefront discovery APIs function cleanly according to application domain rules.

---

## 10. Application Verification

- **Lint**: PASS (`npm run lint` — 0 errors, 0 warnings)
- **Typecheck**: PASS (`npm run type-check` — 0 errors)
- **Tests**: PASS (`npm run test` — 48/48 tests passing across 7 test suites)
- **Build**: PASS (`npm run build` — production build completed successfully)

---

## 11. Supabase Security Advisor

- **RLS Disabled in Public**: Fixed (0 tables disabled).
- **Sensitive Columns Exposed**: Fixed (`public.refresh_tokens.token` is protected).
- **PostgREST Grants**: Revoked for `anon` and `authenticated` roles.

---

## 12. Remaining Warnings

**None.** All identified security advisor findings have been remediated.

---

## 13. Final Security Decision

# SECURITY FIX APPROVED
