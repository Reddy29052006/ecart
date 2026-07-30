# FRONTEND IMPLEMENTATION MASTER PROMPT

You are responsible for building the **complete frontend/UI** of this existing e-commerce application.

The backend has already been developed in stages.

Your job is now to build the frontend **stage by stage** and integrate it with the existing backend.

---

# SOURCE-OF-TRUTH FILES

Before doing ANYTHING, read these files completely:

```text
projectStages.md
projectStructure.md
frontendStages.md
frontendStructure.md
```

Also inspect the current implementation.

These files define the project's architecture and frontend development rules.

Do not replace them with your own architecture.

---

# CRITICAL RULE

The frontend must NOT be built all at once.

You must work:

```text
ONE STAGE AT A TIME
```

After each stage:

```text
Implement
 ↓
Test
 ↓
Audit
 ↓
STOP
 ↓
Wait for my explicit approval
```

You are NOT allowed to automatically continue to the next stage.

---

# CURRENT BACKEND

The application already follows:

```text
Next.js
TypeScript
React
App Router
PostgreSQL
Prisma
Modular Monolith
Contract-first architecture
DTOs
Service classes
Repository classes
Composition root
```

The frontend must integrate with this existing architecture.

---

# DO NOT CREATE A SECOND BACKEND

Do NOT create:

```text
Express
NestJS
Fastify
separate Node backend
```

unless the existing project documentation explicitly requires it.

Next.js is already the full-stack application boundary.

---

# DO NOT REBUILD BACKEND

Before implementing a frontend feature:

1. Find its existing API.
2. Read its DTO.
3. Read its response contract.
4. Read its error format.
5. Understand authentication.
6. Understand authorization.
7. Connect the UI to the existing capability.

If a backend capability is missing:

```text
STOP IMPLEMENTING THAT FUNCTIONALITY.
```

Document:

```text
Missing backend capability
Required API
Required DTO
Why frontend needs it
```

Do not fake the API.

---

# FRONTEND ARCHITECTURE

Follow:

```text
UI
 ↓
Application API / Server Action
 ↓
DTO + Validation
 ↓
Application Service
 ↓
Domain Module
 ↓
Repository
 ↓
Prisma
 ↓
PostgreSQL
```

Never:

```text
UI → Prisma
```

Never:

```text
UI → Repository
```

Never put major business rules inside React components.

---

# UI STYLE

Use:

```text
functional React components
Server Components by default where appropriate
Client Components only when interaction requires them
hooks
composition
```

Do not create class-based React components.

The hybrid TypeScript architecture means:

```text
UI
→ functional

Services
→ classes

Repositories
→ classes
```

---

# DESIGN QUALITY

The frontend must look like a real production e-commerce application.

Do not produce:

```text
plain HTML forms
unstyled pages
default browser controls everywhere
random colors
random spacing
inconsistent cards
unfinished layouts
```

Build a consistent design system.

Every screen should have:

```text
clear hierarchy
consistent spacing
consistent typography
consistent buttons
consistent form controls
responsive layouts
loading states
error states
empty states
```

Do not overdesign the application with unnecessary animations.

Use animation only where it improves UX.

---

# RESPONSIVE DESIGN

Every screen must work on:

```text
mobile
tablet
desktop
large desktop
```

Do not simply shrink desktop layouts.

Design responsive behavior intentionally.

---

# ACCESSIBILITY

Every interactive element must be accessible.

Check:

```text
semantic HTML
keyboard navigation
focus states
labels
form errors
ARIA where necessary
color contrast
screen readers
```

---

# REAL DATA ONLY

Do not use fake data in production flows.

Do not hardcode:

```text
products
prices
inventory
vendors
cart totals
checkout totals
orders
user status
vendor status
```

when real backend data exists.

For a temporary visual-only stage, mock data may be used only when explicitly allowed.

---

# AUTHENTICATION

Implement the actual authentication flow.

Support:

```text
Customer
Vendor
Customer + Vendor
```

Login flow:

```text
Email + Password
       ↓
Authenticate
       ↓
Single role?
   │
   ├── YES → Direct login
   │
   └── NO
         ↓
      Role selection
         ↓
   Customer / Vendor
```

Do not ask for the password again after authentication simply to select a role.

---

# CUSTOMER UI

Build the complete customer experience:

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

# VENDOR UI

Build:

```text
Vendor Dashboard
Vendor Profile
Store
Products
Inventory
Orders
Settings
```

Vendor status:

```text
PENDING
ACTIVE
SUSPENDED
```

The frontend must display the current status.

But:

```text
Vendor must NEVER be able to activate themselves.
```

The backend is authoritative.

---

# UI AUTHORIZATION

Hiding a button is not authorization.

For example:

```text
Vendor
```

may see vendor UI.

But backend authorization must still protect every operation.

Never trust:

```text
localStorage
React state
URL parameters
hidden buttons
```

as authorization.

---

# API INTEGRATION

Before implementing every screen:

```text
Find API
 ↓
Read contract
 ↓
Read DTO
 ↓
Understand response
 ↓
Understand errors
 ↓
Implement UI
```

If API response changes are necessary, do not silently modify the backend.

Document the requirement.

---

# STAGE MANAGEMENT

Determine the current frontend stage by inspecting:

```text
frontendStages.md
frontendStructure.md
existing frontend code
git history if available
```

Do not assume the stage.

If the frontend has never been built:

```text
Start at Stage 0.
```

If Stage 0 is already complete:

```text
Audit it before proceeding.
```

---

# STAGE EXECUTION

For the current stage:

1. Read the stage requirements.
2. Inspect existing implementation.
3. Inspect related backend contracts.
4. Inspect existing UI.
5. Plan the smallest implementation needed.
6. Implement only this stage.
7. Do not implement future-stage features.
8. Run tests.
9. Run TypeScript checks.
10. Run lint.
11. Run build.
12. Check responsive behavior.
13. Check accessibility.
14. Check loading/error/empty states.
15. Review changed files.
16. Verify architecture.
17. Create/update frontend stage audit.
18. STOP.

---

# FRONTEND STAGE AUDIT

After each stage create/update:

```text
docs/audits/frontend-stage-{N}-audit.md
```

Include:

```text
Stage:
Status:

Implemented:
Files changed:

Backend APIs used:

Components created:

Routes created:

Tests:

Responsive verification:

Accessibility verification:

Typecheck:
Lint:
Build:

Architecture compliance:

Problems:

Future-stage functionality accidentally implemented:

Stage approval recommendation:
```

Use:

```text
PASS
PASS WITH CONCERNS
PARTIAL
FAIL
```

---

# STAGE GATE

A stage is NOT complete merely because the UI renders.

A stage requires:

```text
Correct functionality
Correct API integration
Correct architecture
Responsive behavior
Accessibility
Loading states
Error states
Empty states
Type safety
Lint
Build
Relevant tests
No future-stage contamination
```

If any important requirement fails:

```text
STAGE NOT APPROVED
```

STOP.

---

# NEVER AUTO-PROCEED

Even if the current stage passes:

```text
DO NOT START THE NEXT STAGE.
```

Wait for my explicit approval.

Only after I say something equivalent to:

```text
Approved
Continue
Go to next stage
```

may you proceed.

---

# FINAL FRONTEND GOAL

The final application should provide:

```text
                  E-COMMERCE PLATFORM
                         │
          ┌──────────────┴──────────────┐
          │                             │
       CUSTOMER                       VENDOR
          │                             │
          ▼                             ▼
      Storefront                  Vendor Dashboard
          │                             │
      Products                     Products
      Categories                    Inventory
      Product Detail                Orders
      Cart                          Store
      Checkout                      Profile
      Orders                        Settings
      Account
```

All UI must integrate with the actual backend and existing business modules.

---

# FIRST ACTION

Do NOT start coding immediately.

First:

```text
1. Read projectStages.md
2. Read projectStructure.md
3. Read frontendStages.md
4. Read frontendStructure.md
5. Inspect current frontend
6. Inspect current backend contracts
7. Determine actual frontend stage
8. Produce a short frontend stage assessment
9. Start ONLY the approved current stage
```

If the frontend stage is ambiguous, STOP and report the ambiguity.

Never guess.

---

# ABSOLUTE RULES

```text
READ THE FOUR MD FILES FIRST.

BUILD FRONTEND ONLY.

ONE STAGE AT A TIME.

USE EXISTING BACKEND CONTRACTS.

NO FAKE PRODUCTION DATA.

NO DIRECT DATABASE ACCESS FROM UI.

NO BUSINESS LOGIC IN COMPONENTS.

NO SEPARATE BACKEND.

NO FUTURE-STAGE FEATURES.

TEST EVERY STAGE.

AUDIT EVERY STAGE.

STOP AFTER EVERY STAGE.

WAIT FOR EXPLICIT APPROVAL.
```
