# Frontend Architecture & Structure

## 1. Frontend Architecture

The frontend is part of the existing Next.js application.

Do NOT create:

```text
frontend/
backend/
```

as two separate applications.

The project uses:

```text
Next.js
+
React
+
TypeScript
+
App Router
```

with Next.js's native full-stack capabilities.

The architecture is:

```text
                        USER
                          │
                          ▼
                 Next.js UI / React
                          │
                          ▼
                 Application API
                          │
                 ┌────────┴────────┐
                 │                 │
          Route Handlers       Server Actions
                 │                 │
                 └────────┬────────┘
                          ▼
                    DTO + Validation
                          │
                          ▼
                 Application Services
                          │
                          ▼
                    Domain Modules
                          │
                          ▼
                 Repository Contracts
                          │
                          ▼
                  Repository Classes
                          │
                          ▼
                       Prisma
                          │
                          ▼
                     PostgreSQL
```

The UI must never directly access Prisma.

---

# 2. Main Source Structure

```text
ecommerce-platform/
│
├── src/
│   │
│   ├── app/
│   │
│   ├── components/
│   │
│   ├── modules/
│   │
│   ├── hooks/
│   │
│   ├── lib/
│   │
│   ├── types/
│   │
│   ├── config/
│   │
│   └── composition-root.ts
│
├── prisma/
│
├── public/
│
├── tests/
│
├── docs/
│
└── infrastructure/
```

---

# 3. `src/app`

`app` contains:

```text
routes
layouts
pages
loading
error boundaries
route handlers
```

Do not put business logic here.

---

# 4. App Router Structure

Recommended:

```text
src/app/
│
├── (storefront)/
│   ├── page.tsx
│   │
│   ├── products/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   ├── categories/
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   ├── cart/
│   │   └── page.tsx
│   │
│   ├── checkout/
│   │   └── page.tsx
│   │
│   └── orders/
│       ├── page.tsx
│       └── [orderId]/
│           └── page.tsx
│
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   │
│   ├── register/
│   │   └── page.tsx
│   │
│   └── select-role/
│       └── page.tsx
│
├── account/
│   ├── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   ├── addresses/
│   │   └── page.tsx
│   └── security/
│       └── page.tsx
│
├── vendor/
│   ├── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   ├── store/
│   │   └── page.tsx
│   ├── products/
│   │   ├── page.tsx
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── [productId]/
│   │       └── page.tsx
│   ├── inventory/
│   │   └── page.tsx
│   └── orders/
│       ├── page.tsx
│       └── [orderId]/
│           └── page.tsx
│
├── api/
│   └── v1/
│       └── ...
│
├── layout.tsx
├── loading.tsx
├── error.tsx
├── not-found.tsx
└── globals.css
```

The exact route names must be reconciled with existing routes before creating duplicates.

---

# 5. Components

```text
src/components/
│
├── ui/
│   ├── button.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── checkbox.tsx
│   ├── radio.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── dialog.tsx
│   ├── dropdown.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── skeleton.tsx
│   ├── spinner.tsx
│   ├── alert.tsx
│   └── toast.tsx
│
├── layout/
│   ├── header.tsx
│   ├── footer.tsx
│   ├── navigation.tsx
│   ├── mobile-navigation.tsx
│   └── page-container.tsx
│
├── forms/
│   ├── form-field.tsx
│   ├── form-error.tsx
│   └── submit-button.tsx
│
├── product/
│   ├── product-card.tsx
│   ├── product-grid.tsx
│   ├── product-gallery.tsx
│   ├── product-price.tsx
│   └── variant-selector.tsx
│
├── cart/
│   ├── cart-item.tsx
│   ├── cart-list.tsx
│   └── cart-summary.tsx
│
├── checkout/
│   ├── address-section.tsx
│   ├── checkout-items.tsx
│   ├── pricing-summary.tsx
│   └── checkout-validation.tsx
│
├── order/
│   ├── order-card.tsx
│   ├── order-list.tsx
│   ├── order-status.tsx
│   └── order-summary.tsx
│
└── vendor/
    ├── vendor-status.tsx
    ├── vendor-sidebar.tsx
    ├── vendor-product-table.tsx
    ├── inventory-table.tsx
    └── vendor-order-table.tsx
```

---

# 6. Components Rule

Use three levels:

```text
UI primitives
      ↓
Domain-neutral components
      ↓
Business components
```

Example:

```text
Button
 ↓
ProductCard
 ↓
ProductManagementTable
```

Do not make every component a giant reusable abstraction.

Reuse only where there is actual reuse.

---

# 7. Modules

Business modules remain independent from the UI.

```text
src/modules/
│
├── auth/
├── customer/
├── vendor/
├── catalog/
│   └── product/
├── inventory/
├── cart/
├── checkout/
├── order/
├── payment/
├── shipment/
└── notification/
```

The UI can consume module capabilities through approved application contracts.

The UI must not access repository classes directly.

---

# 8. Hooks

Hooks are for reusable UI behavior.

```text
src/hooks/
│
├── use-auth.ts
├── use-cart.ts
├── use-debounce.ts
├── use-media-query.ts
└── ...
```

Do not put business rules inside generic hooks.

---

# 9. `lib`

Shared technical infrastructure:

```text
src/lib/
│
├── api/
├── auth/
├── validation/
├── formatting/
├── errors/
├── logging/
└── utils/
```

Examples:

```text
API client
authentication helpers
formatCurrency
formatDate
error normalization
```

Do not put domain-specific business rules here.

---

# 10. Types

Shared frontend types:

```text
src/types/
│
├── api.ts
├── pagination.ts
├── ui.ts
└── ...
```

Prefer consuming backend/API contracts rather than duplicating domain models unnecessarily.

Do not copy Prisma models into frontend types simply for convenience.

---

# 11. Data Fetching

Prefer:

```text
Server Components
```

for server-side data fetching when appropriate.

Use Client Components when interactivity requires:

```text
state
event handlers
browser APIs
interactive forms
client-side UI state
```

Avoid making the entire application client-rendered unnecessarily.

---

# 12. Authentication State

The frontend must understand:

```text
authenticated / unauthenticated
```

and:

```text
CUSTOMER
VENDOR
```

and selected role.

Example:

```text
User
├── CUSTOMER
└── VENDOR
```

The frontend must not treat role selection as proof of authorization.

The backend remains authoritative.

---

# 13. Role-Based UI

The UI may conditionally display features based on the authenticated role.

Example:

```text
CUSTOMER
→ customer navigation

VENDOR
→ vendor navigation
```

But hiding a button is NOT authorization.

The backend must always enforce permissions.

---

# 14. Customer UI

Customer-facing areas:

```text
Home
Products
Categories
Product Details
Cart
Checkout
Orders
Account
Profile
Addresses
Security
```

---

# 15. Vendor UI

Vendor-facing areas:

```text
Vendor Dashboard
Vendor Profile
Store
Products
Inventory
Orders
Settings
```

Vendor status must be displayed.

Example:

```text
PENDING
```

should clearly communicate:

```text
Your vendor account is awaiting approval.
```

`SUSPENDED` should clearly communicate restricted access.

The frontend must never provide a self-activation control.

---

# 16. API Integration

Frontend API calls should be centralized where appropriate.

Example:

```text
src/lib/api/
├── auth-api.ts
├── product-api.ts
├── cart-api.ts
├── checkout-api.ts
├── order-api.ts
└── vendor-api.ts
```

Do not scatter raw fetch logic throughout every page.

But do not create an abstraction layer solely for abstraction's sake.

---

# 17. UI State Model

Every data-driven page should consider:

```text
initial/loading
success
empty
error
```

For example:

```text
Product list

Loading
   ↓
Success
   ├── Products found
   └── No products
   ↓
Error
```

---

# 18. Form State

Every important form should support:

```text
initial
editing
submitting
success
validation error
server error
```

Example:

```text
Register
   ↓
Submitting...
   ↓
Success
   OR
Validation error
   OR
Server error
```

---

# 19. Responsive Structure

Design for:

```text
mobile
tablet
desktop
large desktop
```

Do not build desktop first and simply shrink it.

Navigation, product grids, checkout, tables, dashboards, and forms must have deliberate responsive behavior.

---

# 20. Accessibility

All UI must support:

```text
keyboard navigation
focus visibility
semantic HTML
accessible labels
form errors
screen readers
appropriate ARIA
color contrast
```

Do not use:

```text
<div onClick>
```

when a semantic button/link is appropriate.

---

# 21. Testing Structure

```text
tests/
│
├── unit/
│   └── frontend/
│
├── integration/
│   └── frontend/
│
└── e2e/
    ├── auth/
    ├── storefront/
    ├── cart/
    ├── checkout/
    ├── customer/
    └── vendor/
```

---

# 22. Frontend Dependency Rules

Allowed:

```text
UI
 ↓
API / Server Action
 ↓
Application Contract
```

Not allowed:

```text
UI
 ↓
Prisma
```

Not allowed:

```text
UI
 ↓
Repository
```

Not allowed:

```text
React Component
 ↓
Database
```

---

# 23. Frontend and Backend Relationship

The frontend and backend are not separate business systems.

They are two layers of the same Next.js modular monolith.

```text
                 Next.js Application
                        │
          ┌─────────────┴─────────────┐
          │                           │
       UI Layer                  Application Layer
          │                           │
     Components                   Services
     Pages                        Domain
     Forms                        Repositories
     Layouts                      Prisma
          │                           │
          └─────────────┬─────────────┘
                        │
                   PostgreSQL
```

The business rules remain outside the UI.

---

# 24. Frontend Stage Ownership

Map frontend work to the existing business roadmap:

```text
Stage 0
→ Frontend foundation audit

Stage 1
→ UI/design foundation

Stage 2
→ Authentication UI

Stage 3
→ Customer/vendor profile UI

Stage 4
→ Vendor product management UI

Stage 5
→ Product discovery/storefront

Stage 6
→ Variant/inventory UI

Stage 7
→ Cart UI

Stage 8
→ Checkout UI

Stage 9
→ Customer order placement

Stage 10
→ Vendor order management

Stage 11
→ Order state/history UI

Stage 12
→ Payment UI

Stage 13
→ Shipment/tracking UI

Stage 14
→ Notifications UI

Stage 15
→ Customer order experience

Stage 16
→ Vendor dashboard

Stage 17
→ Security/accessibility/reliability

Stage 18
→ Testing/deployment/final frontend hardening
```

The existing project roadmap already maps stages 1–18 to business capabilities such as identity, profiles, vendor products, catalog, inventory, cart, checkout, orders, payments, shipping, notifications, customer orders, vendor dashboard, security, and testing/deployment.

---

# 25. Final Rule

The frontend must be developed incrementally.

Never:

```text
Build entire frontend at once
```

Instead:

```text
Stage
 ↓
Implement
 ↓
Test
 ↓
Audit
 ↓
User review
 ↓
Approval
 ↓
Next stage
```

The UI is considered complete only when it satisfies:

```text
Functional
Responsive
Accessible
Type-safe
Tested
Backend-integrated
Architecturally compliant
```
