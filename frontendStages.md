# Frontend Development Stages

## Purpose

This document defines the complete frontend/UI implementation plan for the e-commerce application.

The frontend must be built **stage by stage**.

The frontend implementation must integrate with the existing Next.js full-stack architecture.

The backend is NOT to be rebuilt.

The frontend must consume the existing application contracts, DTOs, services, and APIs.

---

# Core Frontend Principles

The frontend must follow these rules throughout every stage.

## 1. Next.js Native Architecture

Use:

* Next.js
* TypeScript
* React
* App Router
* Server Components where appropriate
* Client Components only where interactivity requires them

The project already uses Next.js as the full-stack application boundary.

Do not create a separate frontend application.

Do not introduce a separate frontend backend-for-frontend unless explicitly justified.

---

## 2. UI Must Be Replaceable

The UI must not contain business rules that belong to application/domain services.

Preferred:

```text
UI
 ↓
Application API / Route Handler / Server Action
 ↓
DTO + Validation
 ↓
Application Service
 ↓
Repository
 ↓
PostgreSQL
```

The UI should consume application capabilities.

The UI must not directly access Prisma.

---

## 3. Functional UI

React/Next.js UI code should remain functional and idiomatic.

Use:

```text
functional components
hooks
server components
client components
composition
```

Do not create class-based React components.

The project's hybrid TypeScript rule applies primarily to services and repositories:

```text
UI/framework code
→ functional

Services
→ classes

Repositories
→ classes
```

---

## 4. Existing Backend Is the Contract

Before creating frontend API calls, inspect:

```text
DTOs
API contracts
route handlers
response types
error formats
authentication model
authorization model
```

Do not invent frontend request/response shapes that contradict the backend.

If a required API does not exist:

```text
DO NOT silently implement a fake API.
```

Document the missing backend capability.

---

## 5. No Fake Functionality

Do not use fake:

```text
products
prices
inventory
orders
users
vendors
cart items
checkout totals
payment status
```

unless explicitly required for a visual prototype stage.

Once the corresponding backend capability exists, connect the UI to the real application.

---

# Stage 0 — Frontend Foundation Audit

## Goal

Understand the existing frontend before implementing new UI.

Do not build business screens yet.

Inspect:

```text
src/app
src/components
src/hooks
src/lib
src/modules
src/types
package.json
projectStages.md
projectStructure.md
```

Determine:

```text
Current UI routes
Current components
Current styling system
Current UI dependencies
Current API integration
Current authentication integration
Current layouts
Current loading/error handling
Current responsive behavior
```

Create:

```text
docs/frontend/frontend-audit.md
```

### Stage 0 Gate

Must verify:

* existing UI architecture
* existing route structure
* existing backend API contracts
* existing authentication flow
* existing component strategy
* existing styling strategy

STOP after audit.

Do not start Stage 1 until approved.

---

# Stage 1 — UI Foundation & Design System

## Goal

Create the reusable visual foundation.

Implement:

```text
application shell
typography
spacing
buttons
inputs
selects
checkboxes
radio buttons
cards
badges
dialogs
dropdowns
tabs
tables
pagination
alerts
toasts
loading states
empty states
error states
skeletons
```

Create reusable components under:

```text
src/components/ui/
```

Create design tokens for:

```text
spacing
radius
typography
shadows
breakpoints
layout widths
```

Do not build business-specific components unnecessarily.

Example:

```text
Button
Input
Modal
Card
Badge
Table
Skeleton
```

should be reusable.

---

# Stage 2 — Global Application Shell

## Goal

Build the common application layout.

Implement:

```text
header
navigation
footer
mobile navigation
responsive container
page layout
breadcrumbs
global loading
global error handling
```

The shell must support:

```text
guest
customer
vendor
```

without duplicating the entire application.

---

# Stage 3 — Authentication UI

## Goal

Build the complete authentication experience using the existing authentication backend.

Implement:

```text
/login
/register
```

and supporting UI.

---

## Customer Registration

Build:

```text
customer registration form
validation
loading state
success state
duplicate-account error
server validation errors
```

---

## Vendor Registration

Build:

```text
vendor registration
vendor-specific fields
validation
pending status messaging
```

---

## Multi-Role Registration

Support the existing business rule:

```text
ONE EMAIL
    ↓
CUSTOMER
    +
VENDOR
```

If the user already has one role and registers for the other role, the UI must clearly explain what is happening.

---

## Login

The login UI must support:

```text
Email
Password
```

For a single-role user:

```text
Email + Password
       ↓
Direct login
       ↓
Role dashboard
```

For a dual-role user:

```text
Email + Password
       ↓
Authentication
       ↓
Choose:
   Customer
   Vendor
```

The UI must not ask the user to enter the password again just to select a role.

---

## Vendor Status

If vendor status is:

```text
PENDING
```

show appropriate pending messaging.

If:

```text
ACTIVE
```

allow vendor experience.

If:

```text
SUSPENDED
```

show appropriate restricted-access messaging.

Do not allow the frontend to bypass backend authorization.

---

# Stage 4 — Public Storefront Foundation

## Goal

Build the public shopping experience.

Implement:

```text
/
```

Home page.

Include:

```text
hero
featured products
categories
promotional sections
popular products
vendor/product discovery
footer
```

Do not hardcode product data when the backend API exists.

---

# Stage 5 — Product Discovery UI

## Goal

Implement:

```text
/products
/categories/[slug]
```

Features:

```text
product grid
product cards
search
category filtering
sorting
pagination
loading state
empty state
error state
```

Product card should support:

```text
image
name
price
discount
vendor
rating if available
stock state
```

Only display information supported by the backend contract.

---

# Stage 6 — Product Details UI

## Goal

Implement:

```text
/products/[slug]
```

Features:

```text
image gallery
product information
price
vendor
description
variants
inventory availability
quantity selector
add to cart
```

Variant selection must use real backend data.

Example:

```text
Color:
○ Black
○ White

Size:
○ S
○ M
○ L
```

The UI must prevent invalid selections.

---

# Stage 7 — Customer Profile UI

## Goal

Implement the customer account experience.

Routes:

```text
/account
/account/profile
/account/addresses
/account/security
```

Features:

```text
profile
personal information
addresses
default address
account status
security
logout
```

Customer status must come from backend data.

---

# Stage 8 — Vendor Profile & Store Management UI

## Goal

Implement vendor-facing profile/store management.

Routes:

```text
/vendor
/vendor/profile
/vendor/store
/vendor/settings
```

Support:

```text
vendor profile
business information
store information
vendor status
```

Vendor status display:

```text
PENDING
ACTIVE
SUSPENDED
```

Important:

The UI must NOT provide a self-activation mechanism.

The frontend must never assume:

```text
Vendor → can make themselves ACTIVE
```

The backend remains authoritative.

---

# Stage 9 — Vendor Product Management UI

## Goal

Build the vendor product management experience.

Routes:

```text
/vendor/products
/vendor/products/new
/vendor/products/[id]
```

Features:

```text
product list
create product
edit product
delete/archive product
product status
product images
categories
variants
pricing
```

Use existing product contracts.

---

# Stage 10 — Inventory UI

## Goal

Implement inventory management.

Routes:

```text
/vendor/inventory
/vendor/products/[id]/inventory
```

Features:

```text
stock overview
variant stock
stock adjustment
low-stock indicator
out-of-stock indicator
inventory history if supported
```

Never calculate authoritative stock solely in the UI.

Backend remains authoritative.

---

# Stage 11 — Shopping Cart UI

## Goal

Connect the frontend cart to the existing cart module.

Route:

```text
/cart
```

Features:

```text
cart items
product image
product name
variant
quantity
unit price
subtotal
remove item
update quantity
empty cart
```

States:

```text
loading
empty
loaded
error
```

Cart totals must use backend data.

---

# Stage 12 — Checkout UI

## Goal

Build the checkout experience on top of the existing checkout preview pipeline.

Route:

```text
/checkout
```

The UI must integrate with the existing checkout validation.

The checkout screen should support:

```text
customer information
shipping address
cart review
pricing summary
tax
shipping
discount
final total
```

---

## Checkout Validation

The backend is authoritative.

The frontend should present validation failures clearly.

Example:

```text
Address missing
Product unavailable
Variant unavailable
Vendor inactive
Price changed
Insufficient stock
```

Do not duplicate business rules unnecessarily.

---

# Stage 13 — Order Placement UI

## Goal

Implement the order placement experience.

After successful checkout:

```text
Order created
      ↓
Success page
```

Example:

```text
/order/success/[orderId]
```

Display:

```text
order number
items
total
shipping information
order status
next steps
```

---

# Stage 14 — Customer Orders UI

## Goal

Implement customer order experience.

Routes:

```text
/orders
/orders/[orderId]
```

Features:

```text
order history
order details
order status
items
totals
shipping information
tracking information when available
```

The roadmap specifically includes Customer Order Experience as a separate business capability.

---

# Stage 15 — Vendor Order Management UI

## Goal

Implement vendor operational order management.

Routes:

```text
/vendor/orders
/vendor/orders/[orderId]
```

Features:

```text
orders list
order details
customer information allowed by authorization
items
order status
processing actions
shipment information
```

Only expose data permitted by backend authorization.

---

# Stage 16 — Vendor Dashboard

## Goal

Build the complete vendor operational dashboard.

Route:

```text
/vendor
```

Dashboard sections:

```text
sales summary
orders
products
inventory
low stock
recent orders
store status
important alerts
```

Use real backend data.

Do not create fake analytics.

If a metric is not supported by the backend:

```text
Do not invent it.
```

Document it as a future backend requirement.

---

# Stage 17 — Responsive & Accessibility Hardening

## Goal

Make the complete application production-quality across devices.

Verify:

```text
mobile
tablet
desktop
large desktop
```

Accessibility:

```text
keyboard navigation
focus states
labels
ARIA where necessary
semantic HTML
color contrast
screen-reader usability
error announcements
form accessibility
```

Do not rely only on visual testing.

---

# Stage 18 — Frontend Performance & Reliability

Review:

```text
Server Components
Client Components
data fetching
caching
loading states
image optimization
bundle size
unnecessary client JavaScript
re-rendering
error boundaries
```

Avoid making everything a Client Component.

Use Server Components by default where appropriate.

---

# Stage 19 — Frontend Testing

Create:

```text
tests/
├── unit/
├── integration/
└── e2e/
```

Test:

```text
authentication
role selection
customer registration
vendor registration
product discovery
product details
cart
checkout
customer orders
vendor product management
vendor dashboard
authorization-sensitive UI behavior
```

The frontend must never be considered complete merely because pages render.

---

# Stage 20 — Final Frontend Audit

Perform a complete frontend audit.

Verify:

```text
UI
routes
components
API integration
authentication
authorization behavior
responsive design
accessibility
loading states
error states
empty states
tests
performance
TypeScript
lint
build
```

Create:

```text
docs/audits/frontend-final-audit.md
```

Final status must be:

```text
FRONTEND APPROVED
```

or:

```text
FRONTEND NOT APPROVED
```

---

# FRONTEND STAGE GATE RULE

NEVER automatically continue from one stage to another.

For every stage:

```text
READ frontendStages.md
        ↓
READ frontendStructure.md
        ↓
Inspect existing implementation
        ↓
Identify current stage
        ↓
Implement ONLY current stage
        ↓
Run verification
        ↓
Create stage audit
        ↓
STOP
        ↓
WAIT FOR EXPLICIT USER APPROVAL
```

Do not start the next stage without explicit approval.

---

# Definition of Done

A frontend stage is complete only when:

* implementation matches this document
* implementation matches frontendStructure.md
* backend contracts are respected
* no fake production data remains
* responsive behavior is verified
* loading states exist
* error states exist
* empty states exist
* TypeScript passes
* lint passes
* build passes
* tests relevant to the stage pass
* no future-stage functionality was accidentally implemented
* architecture remains consistent

Only then can the stage be proposed for approval.
