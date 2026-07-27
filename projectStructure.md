while keeping the architecture open for:

```text
Admin
Payments
Shipping providers
Notifications
Reviews
Coupons
Returns
Analytics
```

later.

The biggest recommendation I have is:

> **Do not organize the entire project around pages. Organize the business logic around modules.**

A new developer should be able to open the repository and understand where **authentication, products, inventory, carts, orders, vendors, and customers** live without searching through hundreds of files.

---

# 1. Recommended Technology Stack

For the first version:

```text
Frontend + Backend
        ↓
     Next.js
        ↓
   TypeScript
        ↓
   Next.js App Router
        ↓
   Native full-stack capabilities
        ↓
Route Handlers / Server Components / Server Actions
        ↓
 Application + Domain Logic
        ↓
 Services / Repository contracts
        ↓
 PostgreSQL via Prisma
```

I recommend:

### Frontend

* Next.js
* TypeScript
* React
* App Router
* Server Components where appropriate
* Client Components only when interactivity requires them

### Backend

Use Next.js's native full-stack capabilities first:

* Route Handlers
* Server Components
* Server Actions where appropriate
* Server-side application services
* Authentication layer
* Validation
* Repository layer
* Database layer

We do **not** introduce a separate Express/Nest/Fastify backend initially.

### Database

```text
PostgreSQL
```

with:

```text
Prisma ORM
```

for schema management, migrations, transactions, and type-safe database access.

### Other important pieces

```text
TypeScript
Zod
Prisma
ESLint
Prettier
Git
```

We can choose specific authentication, image storage, payment, email, and testing libraries when we reach those modules.

---

# 2. The Architecture I Recommend

I recommend a **modular monolith** inside Next.js.

The application is one deployable system, but each business capability has a clear module boundary. Those boundaries are intentionally designed so a module can be extracted into a separate service later if real business needs justify it.

Not this:

```text
app/
├── products/
├── orders/
├── vendors/
└── ...
```

with all business logic scattered throughout pages and route handlers.

Instead:

```text
src/
├── app/
├── modules/
├── lib/
├── components/
├── hooks/
├── types/
└── config/
```

The most important directory is:

```text
modules/
```

because that is where the actual e-commerce business domains live.

---

# 3. Recommended Complete Folder Structure

Here is the structure I would use for our project.

```text
ecommerce-platform/
│
├── src/
│   │
│   ├── app/
│   │   ├── (storefront)/
│   │   │   ├── page.tsx
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── categories/[slug]/page.tsx
│   │   │   ├── cart/page.tsx
│   │   │   ├── checkout/page.tsx
│   │   │   └── orders/
│   │   │       ├── page.tsx
│   │   │       └── [orderId]/page.tsx
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   │
│   │   ├── vendor/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [productId]/page.tsx
│   │   │   ├── inventory/page.tsx
│   │   │   └── orders/
│   │   │       ├── page.tsx
│   │   │       └── [orderId]/page.tsx
│   │   │
│   │   ├── account/
│   │   │   ├── page.tsx
│   │   │   ├── addresses/page.tsx
│   │   │   └── orders/page.tsx
│   │   │
│   │   ├── api/v1/
│   │   │   ├── auth/
│   │   │   │   ├── register/
│   │   │   │   ├── vendor/register/
│   │   │   │   ├── login/
│   │   │   │   ├── select-role/
│   │   │   │   ├── logout/
│   │   │   │   ├── refresh/
│   │   │   │   └── me/
│   │   │   ├── customers/
│   │   │   ├── vendors/
│   │   │   ├── products/
│   │   │   ├── categories/
│   │   │   ├── inventory/
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   ├── orders/
│   │   │   ├── payments/
│   │   │   ├── shipments/
│   │   │   └── notifications/
│   │   │
│   │   ├── layout.tsx
│   │   ├── not-found.tsx
│   │   └── globals.css
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.contracts.ts
│   │   │   ├── auth.dto.ts
│   │   │   ├── auth.types.ts
│   │   │   ├── auth.validation.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── customer/
│   │   │   ├── customer.contracts.ts
│   │   │   ├── customer.dto.ts
│   │   │   ├── customer.types.ts
│   │   │   ├── customer.validation.ts
│   │   │   ├── customer.service.ts
│   │   │   ├── customer.repository.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── vendor/
│   │   │   ├── vendor.contracts.ts
│   │   │   ├── vendor.dto.ts
│   │   │   ├── vendor.types.ts
│   │   │   ├── vendor.validation.ts
│   │   │   ├── vendor.service.ts
│   │   │   ├── vendor.repository.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── catalog/
│   │   │   ├── product/
│   │   │   │   ├── product.contracts.ts
│   │   │   │   ├── product.dto.ts
│   │   │   │   ├── product.types.ts
│   │   │   │   ├── product.validation.ts
│   │   │   │   ├── product.service.ts
│   │   │   │   ├── product.repository.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── category/
│   │   │   │   ├── category.contracts.ts
│   │   │   │   ├── category.dto.ts
│   │   │   │   ├── category.types.ts
│   │   │   │   ├── category.validation.ts
│   │   │   │   ├── category.service.ts
│   │   │   │   ├── category.repository.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── catalog.types.ts
│   │   │
│   │   ├── inventory/
│   │   │   ├── inventory.contracts.ts
│   │   │   ├── inventory.dto.ts
│   │   │   ├── inventory.types.ts
│   │   │   ├── inventory.validation.ts
│   │   │   ├── inventory.service.ts
│   │   │   ├── inventory.repository.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── cart/
│   │   │   ├── cart.contracts.ts
│   │   │   ├── cart.dto.ts
│   │   │   ├── cart.types.ts
│   │   │   ├── cart.validation.ts
│   │   │   ├── cart.service.ts
│   │   │   ├── cart.repository.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── checkout/
│   │   │   ├── checkout.contracts.ts
│   │   │   ├── checkout.dto.ts
│   │   │   ├── checkout.types.ts
│   │   │   ├── checkout.validation.ts
│   │   │   ├── checkout.service.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── order/
│   │   │   ├── order.contracts.ts
│   │   │   ├── order.dto.ts
│   │   │   ├── order.types.ts
│   │   │   ├── order.validation.ts
│   │   │   ├── order.service.ts
│   │   │   ├── order.repository.ts
│   │   │   ├── order-status.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── payment/
│   │   │   ├── payment.contracts.ts
│   │   │   ├── payment.dto.ts
│   │   │   ├── payment.types.ts
│   │   │   ├── payment.service.ts
│   │   │   ├── payment.provider.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── shipment/
│   │   │   ├── shipment.contracts.ts
│   │   │   ├── shipment.dto.ts
│   │   │   ├── shipment.types.ts
│   │   │   ├── shipment.service.ts
│   │   │   ├── shipment.provider.ts
│   │   │   └── index.ts
│   │   │
│   │   └── notification/
│   │       ├── notification.contracts.ts
│   │       ├── notification.dto.ts
│   │       ├── notification.types.ts
│   │       ├── notification.service.ts
│   │       └── index.ts
│   │
│   │   # Contract-first rule:
│   │   # contracts → DTOs → validation → service class → repository contract
│   │   # → repository class → Prisma → PostgreSQL
│   │   # Each module exposes only its public API through index.ts.
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── product/
│   │   ├── cart/
│   │   ├── order/
│   │   └── vendor/
│   │
│   ├── hooks/
│   │   ├── use-cart.ts
│   │   ├── use-auth.ts
│   │   └── use-debounce.ts
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   └── prisma.ts
│   │   ├── auth/
│   │   │   ├── session.ts
│   │   │   └── permissions.ts
│   │   ├── errors/
│   │   │   ├── app-error.ts
│   │   │   └── error-handler.ts
│   │   ├── http/
│   │   │   └── api-response.ts
│   │   ├── logger/
│   │   │   └── logger.ts
│   │   └── utils/
│   │
│   ├── config/
│   │   ├── env.ts
│   │   ├── routes.ts
│   │   └── constants.ts
│   │
│   └── composition-root.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── docs/
│   ├── architecture/
│   │   ├── overview.md
│   │   └── adr/
│   │       ├── ADR-001-nextjs-native-fullstack.md
│   │       ├── ADR-002-postgresql-prisma.md
│   │       ├── ADR-003-modular-monolith.md
│   │       ├── ADR-004-hybrid-typescript-style.md
│   │       ├── ADR-005-contracts-first.md
│   │       └── ADR-006-composition-root.md
│   │
│   ├── business/
│   │   ├── customer-flow.md
│   │   ├── vendor-flow.md
│   │   └── order-lifecycle.md
│   │
│   ├── database/
│   │   └── schema.md
│   │
│   ├── api/
│   │   └── conventions.md
│   │
│   └── engineering/
│       ├── standards.md
│       ├── module-boundaries.md
│       └── development-workflow.md
│
├── public/
│   ├── images/
│   └── icons/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/
│   └── ...
│
├── .env.local
├── .env.example
├── .gitignore
├── eslint.config.mjs
├── prettier.config.mjs
├── next.config.ts
├── package.json
├── tsconfig.json
├── README.md
└── ...
```

This may look large at first, but there is a very good reason for it.

---

# 4. Understand the Folder Structure

There are **four major areas** you need to understand.

```text
src/
│
├── app/
├── modules/
├── components/
└── lib/
```

Think of them as:

```text
app       → Where users enter the application
modules   → What the business does
components → What users see
lib       → Shared technical infrastructure
```

That one rule makes the project much easier to understand.

---

# 4.1 The Architectural Dependency Direction

The application follows this direction:

```text
Next.js UI / Framework
        ↓
Route Handler / Server Action
        ↓
DTO + Validation
        ↓
Application Service Contract
        ↓
Service Class
        ↓
Repository Contract
        ↓
Repository Class
        ↓
Prisma
        ↓
PostgreSQL
```

The UI/framework layer remains functional and idiomatic to Next.js.

Services and repositories are classes.

The database implementation remains behind repositories.

---

# 4.2 Composition Root

The composition root is the place where concrete implementations are wired together.

```text
src/composition-root.ts
```

Conceptually:

```text
Prisma Client
     ↓
Repository classes
     ↓
Service classes
     ↓
Module public APIs
```

A Route Handler should not do this:

```text
new PrismaClient()
new OrderRepository()
new OrderService()
```

Instead it obtains the already-wired application capability from the composition root.

This gives us one place to control dependency construction and makes testing easier.

---

# 4.3 Contracts First

For every new feature:

```text
1. Define the use case
2. Define input DTO
3. Define output DTO
4. Define application contract
5. Define repository contract
6. Define validation
7. Define business rules
8. Implement service class
9. Implement repository class
10. Connect the UI
11. Test the behavior
```

We do not start by writing Prisma queries and then design the application around them.

---

# 4.4 Modular Monolith Boundary

The project is one deployable application, but business modules are independently organized.

Each module owns:

```text
Business rules
Use cases
DTOs
Contracts
Repository abstractions
Database implementations
Public API
```

Other modules should use only the public API of a module.

This means a future extraction can follow:

```text
Current:

Next.js Modular Monolith
        │
        ├── Order Module
        ├── Payment Module
        └── Inventory Module

Possible future:

Order Service
Payment Service
Inventory Service
```

We do **not** build microservices now. We preserve the option without paying the operational cost prematurely.

---

# 5. `app/` — Routes and Pages Only

The `app` directory should primarily answer:

> "What URL is this?"

For example:

```text
app/products/page.tsx
```

means:

```text
/products
```

And:

```text
app/products/[slug]/page.tsx
```

means:

```text
/products/nike-running-shoes
```

Don't put complicated business logic inside these files.

---

# 6. API Routes

We'll use Next.js Route Handlers.

For example:

```text
src/app/api/v1/products/route.ts
```

This represents:

```text
GET  /api/v1/products
POST /api/v1/products
```

And:

```text
src/app/api/v1/products/[id]/route.ts
```

represents:

```text
GET    /api/v1/products/:id
PUT    /api/v1/products/:id
DELETE /api/v1/products/:id
```

But the route should remain thin.

---

# 7. Very Important: Don't Put Business Logic in Route Handlers

Bad:

```text
route.ts
    ↓
validate
    ↓
database query
    ↓
calculate price
    ↓
check vendor
    ↓
update stock
    ↓
create order
    ↓
send email
```

That becomes a nightmare.

Instead:

```text
route.ts
    ↓
validation
    ↓
service
    ↓
repository
    ↓
PostgreSQL
```

For example:

```text
POST /api/v1/vendor/products
            │
            ↓
product route
            │
            ↓
productService.createProduct()
            │
            ↓
productRepository.create()
            │
            ↓
PostgreSQL
```

That's much easier to maintain.

---

# 8. `modules/` — The Heart of the Application

This is the most important folder.

Each module represents a business capability.

For example:

```text
modules/
├── auth/
├── customer/
├── vendor/
├── catalog/
├── inventory/
├── cart/
├── checkout/
├── order/
├── payment/
├── shipment/
└── notification/
```

A new developer should immediately understand:

> "This project is divided according to business domains."

That's exactly what we want.

---

# 9. Inside a Module

Take:

```text
modules/order/
```

Every business module follows the same basic architecture:

```text
order/
├── order.contracts.ts
├── order.dto.ts
├── order.types.ts
├── order.validation.ts
├── order.service.ts
├── order.repository.ts
├── order-status.ts
└── index.ts
```

The important rule is the **order of thinking**:

```text
Contract
   ↓
DTO
   ↓
Validation
   ↓
Business rules
   ↓
Service implementation
   ↓
Repository contract
   ↓
Repository implementation
```

The exact number of files can grow when a module becomes more complex, but the dependency direction must remain clear.

---

# 10. `order.contracts.ts`

This defines the contracts that the application depends on.

For example:

```text
OrderRepository
OrderService
OrderEventPublisher
```

The contracts describe **what the module needs or provides**, not how it is implemented.

A contract should not expose Prisma-specific types.

Conceptually:

```text
OrderService
    ↓
OrderRepository contract
    ↓
PostgreSQL repository implementation
```

This is what gives us a clean module boundary and keeps future extraction possible.

---

# 11. `order.dto.ts`

DTOs define the data crossing application boundaries.

For example:

```text
CreateOrderDto
CancelOrderDto
UpdateOrderStatusDto

OrderResponseDto
VendorOrderResponseDto
OrderSummaryDto
```

DTOs are deliberately separate from:

```text
Prisma models
Database rows
Internal domain objects
```

A frontend component should not need to understand the Prisma schema.

---

# 12. `order.validation.ts`

This handles incoming data validation.

For example:

```text
CreateOrderDto
CancelOrderDto
UpdateOrderStatusDto
```

Use a schema validation library such as Zod.

The frontend is not trusted.

The backend validates everything.

Validation should produce data that satisfies the DTO contract before the service is called.

---

# 13. `order.service.ts`

This contains the **business rules** and is implemented as a **class**.

For example:

```text
class OrderService {
    createOrder()
    cancelOrder()
    getCustomerOrder()
    getVendorOrder()
    acceptVendorOrder()
    rejectVendorOrder()
}
```

Dependencies should be provided through the constructor:

```text
OrderService(
    orderRepository,
    inventoryService,
    pricingService,
    paymentService
)
```

The service answers:

> "What should the system do?"

Example:

```text
acceptVendorOrder()

1. Find vendor order
2. Check current vendor
3. Check ownership
4. Check current status
5. Verify transition is allowed
6. Update status
7. Create history
8. Publish event
9. Trigger notification
```

That belongs in the service.

---

# 14. `order.repository.ts`

This handles PostgreSQL operations and is implemented as a **class**.

For example:

```text
class OrderRepository {
    findOrderById()
    findOrdersByCustomer()
    findOrdersByVendor()
    createOrder()
    updateOrderStatus()
    createOrderHistory()
}
```

The repository answers:

> "How do we get/save this data?"

The service answers:

> "Why and when should we do it?"

The repository implements the repository contract and uses Prisma internally.

For example:

```text
OrderRepository
      ↓
Prisma Client
      ↓
PostgreSQL
```

No Prisma calls should leak into React components or business services.

---

# 15. `index.ts`

This gives the module a clean public boundary.

Instead of another module reaching deeply into:

```text
modules/order/order.repository.ts
modules/order/order.service.ts
```

it should consume the module's public exports.

For example:

```text
modules/order/index.ts
```

can expose:

```text
OrderService contract
OrderService types
Order DTOs
Order use cases
Order public events
```

while keeping database implementation details private.

This rule is essential for the modular monolith:

```text
Module A
   ↓
Module B public API
   ↓
Module B internals
```

not:

```text
Module A
   ↓
Module B repository
   ↓
Module B Prisma query
```

# 16. Catalog Structure

Catalog is slightly different because it contains related concepts.

```text
catalog/
│
├── product/
│   ├── product.types.ts
│   ├── product.validation.ts
│   ├── product.service.ts
│   ├── product.repository.ts
│   └── index.ts
│
├── category/
│   ├── category.types.ts
│   ├── category.validation.ts
│   ├── category.service.ts
│   ├── category.repository.ts
│   └── index.ts
│
└── catalog.types.ts
```

Later we can add:

```text
catalog/
├── brand/
├── review/
├── product-attribute/
└── ...
```

without destroying the existing structure.

---

# 17. Prisma + PostgreSQL Folder

Keep database infrastructure centralized:

```text
src/
├── lib/
│   └── db/
│       └── prisma.ts
│
└── composition-root.ts
```

The Prisma Client is created once and shared through the application composition root.

The application should not create database connections inside individual services or repositories.



---

# 18. PostgreSQL Tables and Relationships

Our initial database could contain these relational tables:

```text
users
customer_profiles
vendor_profiles
addresses

categories
products
product_variants
product_images

inventory
inventory_movements

carts
cart_items

orders
order_items
vendor_orders
order_status_history

payments
payment_transactions

shipments
tracking_events

notifications
```

The relationships should be represented explicitly through Prisma relations and PostgreSQL foreign keys.

For example:

```text
User
 ├── CustomerProfile
 ├── VendorProfile
 └── Address

Product
 ├── ProductVariant
 └── ProductImage

Order
 ├── OrderItem
 └── VendorOrder

ProductVariant
 └── Inventory
```

Later:

```text
reviews
wishlists
coupons
returns
refunds
vendor_payouts
commissions
```

can be introduced.



---

# 19. PostgreSQL Naming

Use clear table/model names:

```text
User
CustomerProfile
VendorProfile
Product
ProductVariant
Order
OrderItem
VendorOrder
```

Use camelCase for TypeScript and Prisma field names:

```text
vendorId
productId
createdAt
updatedAt
```

The exact SQL naming strategy can be controlled by Prisma mappings if needed, but application-level names should remain consistent.



---

# 20. PostgreSQL IDs

Use PostgreSQL-compatible primary keys managed through Prisma.

Conceptually:

```text
User
    id

Product
    id

Order
    id
```

References should use explicit foreign keys:

```text
vendorId
productId
customerId
orderId
```

Do not use product names or emails as database references.



---

# 21. Don't Overcomplicate PostgreSQL Relationships

PostgreSQL gives us explicit relational modeling.

Use relationships where the data is independently managed or has a meaningful lifecycle.

For example:

```text
Product
   ├── ProductVariant
   └── ProductImage
```

and:

```text
Order
   ├── OrderItem
   └── VendorOrder
```

Use JSON fields only when the data is genuinely flexible and does not need to behave like a core relational entity.

The default for core commerce data should be explicit tables, foreign keys, constraints, and transactions.



---

# 22. Product Data

I would conceptually separate:

```text
Product
ProductVariant
ProductImage
Inventory
```

instead of one giant document.

Something like:

```text
Product
   │
   ├── ProductVariant
   │       │
   │       └── Inventory
   │
   └── ProductImage
```

This matches our business model.

---

# 23. Order Data

Similarly:

```text
Order
 │
 ├── OrderItem
 │
 └── VendorOrder
       │
       └── Shipment
```

This is especially important for multi-vendor orders.

---

# 24. PostgreSQL Indexes

This is something we should plan from the beginning.

For example, products will frequently be searched by:

```text
vendorId
categoryId
slug
status
```

Orders by:

```text
customerId
vendorId
status
createdAt
```

Cart by:

```text
customerId
```

Inventory by:

```text
variantId
```

We should create indexes according to actual query patterns.

**Don't create indexes on every field.**

Indexes improve reads but have write/storage costs.

---

# 25. Unique Constraints

Some data needs uniqueness.

Examples:

```text
User.email
Product.slug
ProductVariant.sku
Order.orderNumber
```

PostgreSQL unique indexes should enforce critical uniqueness at the database level.

Don't rely only on:

```text
if (!existingUser) {
   createUser()
}
```

because concurrent requests can bypass application-level checks.

---

# 26. Customer vs User

This is a very important distinction.

Don't make:

```text
User
    ↓
everything
```

Instead:

```text
User
 ├── Authentication
 ├── Identity
 └── Role

CustomerProfile
 └── Customer-specific data

VendorProfile
 └── Vendor-specific data
```

This makes adding Admin later much easier.

Eventually:

```text
User
 ├── Customer
 ├── Vendor
 └── Admin
```

---

# 27. Customer UI Structure

Customer-facing pages live under:

```text
app/(storefront)/
```

Why the parentheses?

Next.js route groups allow us to organize routes without adding the folder name to the URL.

So:

```text
app/(storefront)/products/
```

still becomes:

```text
/products
```

This is clean.

---

# 28. Vendor UI Structure

Vendor-specific screens:

```text
app/vendor/
```

Example:

```text
/vendor/dashboard
/vendor/products
/vendor/inventory
/vendor/orders
```

This makes it immediately obvious to a developer:

> "Everything under `vendor` is vendor functionality."

---

# 29. Authentication UI

Keep authentication separate:

```text
app/(auth)/
```

For example:

```text
/login
/register
/forgot-password
```

This keeps authentication screens independent from the storefront.

---

# 30. Shared Components

Use:

```text
components/
```

for reusable UI.

For example:

```text
components/
├── ui/
│   ├── Button
│   ├── Input
│   ├── Modal
│   ├── Table
│   └── ...
│
├── product/
│   ├── ProductCard
│   ├── ProductGallery
│   └── ProductPrice
│
├── cart/
│   ├── CartItem
│   └── CartSummary
│
└── order/
    ├── OrderStatus
    ├── OrderItem
    └── OrderTimeline
```

---

# 31. Component Rule

A component should generally answer:

> "What should this UI look like?"

Not:

> "How should the business operate?"

For example:

```text
ProductCard
```

can display:

```text
image
name
price
availability
```

But it shouldn't contain:

```text
PostgreSQL query
inventory calculation
vendor authorization
```

---

# 32. Business Logic Rule

Business logic should live in:

```text
modules/
```

For example:

```text
modules/inventory/inventory.service.ts
```

should handle:

```text
reserveStock()
releaseStock()
increaseStock()
decreaseStock()
```

Not:

```text
components/ProductCard.tsx
```

---

# 33. Server vs Client Components

Next.js gives us Server Components and Client Components.

Our default should be:

> **Server Component unless the component genuinely needs client-side interaction.**

Good Server Component candidates:

```text
Product page
Product listing
Order details
Vendor order list
Vendor dashboard data
```

Client Component candidates:

```text
Add-to-cart button
Quantity selector
Image carousel
Cart interactions
Filters requiring immediate client interaction
Form interactions
```

Don't add:

```text
"use client"
```

to every component.

---

# 34. Data Fetching

We should avoid unnecessarily doing:

```text
Browser
 ↓
Next.js page
 ↓
API
 ↓
Service
 ↓
Repository
 ↓
PostgreSQL
```

for every server-rendered screen.

Use Next.js's native server capabilities first.

Where appropriate, Server Components can directly call the already-wired server-side application services.

For example:

```text
Product Page
      ↓
Application service
      ↓
ProductRepository
      ↓
Prisma
      ↓
PostgreSQL
```

For browser interactions that genuinely require an HTTP boundary:

```text
Client Component
      ↓
API Route Handler
      ↓
DTO + Validation
      ↓
Service class
      ↓
Repository class
      ↓
Prisma
      ↓
PostgreSQL
```

This avoids unnecessary internal HTTP hops while keeping a clear API boundary where one is actually needed.

---

# 35. API Versioning

I recommend starting with:

```text
/api/v1/
```

For example:

```text
/api/v1/products
/api/v1/cart
/api/v1/orders
/api/v1/vendor/orders
```

Later we can introduce:

```text
/api/v2/
```

without breaking older consumers.

---

# 36. Recommended API Organization

```text
api/v1/
│
├── auth/
│   ├── login/
│   ├── register/
│   └── logout/
│
├── customers/
│   ├── me/
│   └── addresses/
│
├── vendors/
│   └── me/
│
├── products/
│
├── categories/
│
├── inventory/
│
├── cart/
│
├── checkout/
│
├── orders/
│
├── payments/
│
├── shipments/
│
└── notifications/
```

---

# 37. Don't Duplicate APIs for Everything

For example, don't create:

```text
/customer/products
/vendor/products
/admin/products
```

if the underlying product resource is the same.

Instead:

```text
/products
```

with authorization controlling what operations are allowed.

Vendor-specific operations can live under:

```text
/vendor/products
```

when the intent is specifically vendor management.

---

# 38. Example Request Flow

Let's say Vendor wants to create a product.

The flow should be:

```text
Vendor UI
   │
   ↓
POST /api/v1/vendors/me/products
   │
   ↓
Route Handler
   │
   ├── Authenticate
   ├── Validate input
   └── Call service
          │
          ↓
   productService.createProduct()
          │
          ├── Verify vendor
          ├── Apply business rules
          └── Call repository
                    │
                    ↓
            productRepository
                    │
                    ↓
                 PostgreSQL
```

That's the pattern I want us to repeat throughout the application.

---

# 39. Example Order Flow

Customer places an order:

```text
Checkout UI
     ↓
POST /api/v1/checkout
     ↓
Checkout Route
     ↓
checkoutService
     ↓
Validate cart
     ↓
Validate inventory
     ↓
Calculate final amount
     ↓
Order Service
     ↓
Create Order
     ↓
Create Order Items
     ↓
Create Vendor Orders
     ↓
Reserve Inventory
     ↓
Create Payment
     ↓
Create Events
     ↓
PostgreSQL
```

That is our central business flow.

---

# 40. Service Dependencies

We should be careful about module dependencies.

For example:

```text
Checkout
   ↓
Cart
   ↓
Inventory
   ↓
Order
   ↓
Payment
```

But avoid circular dependencies.

Bad:

```text
Order → Payment
Payment → Order
Order → Checkout
Checkout → Order
```

We should establish clear boundaries.

---

# 41. Shared `lib/` Should Stay Small

This is another important rule.

Don't create:

```text
lib/
├── product.ts
├── order.ts
├── cart.ts
├── vendor.ts
```

That would eventually become another dumping ground.

`lib` should contain **technical infrastructure shared across modules**.

Good:

```text
lib/db
lib/auth
lib/logger
lib/errors
lib/http
lib/utils
```

Business logic belongs in:

```text
modules/
```

---

# 42. Don't Create a Giant `utils.ts`

Avoid this:

```text
utils.ts
```

with:

```text
50 unrelated functions
```

Instead:

```text
lib/utils/
├── date.ts
├── currency.ts
├── slug.ts
├── pagination.ts
└── object.ts
```

Only create a utility when it is actually shared.

---

# 43. Environment Variables

Create:

```text
.env.local
```

for local development.

And:

```text
.env.example
```

for the project documentation.

Example:

```text
DATABASE_URL=

AUTH_SECRET=

NEXT_PUBLIC_APP_URL=

STORAGE_BUCKET=
STORAGE_REGION=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
```

Never commit real secrets.

---

# 44. Prisma + PostgreSQL Connection Pattern

We should have exactly one reusable Prisma Client:

```text
src/lib/db/prisma.ts
```

The application should import the Prisma Client from there.

The database layer owns connection management.

Do not create independent Prisma clients throughout:

```text
product.service.ts
order.service.ts
cart.service.ts
```

The composition root receives the shared Prisma Client and passes it into repository implementations.

The database infrastructure is:

```text
Application
    ↓
Repository classes
    ↓
Prisma Client
    ↓
PostgreSQL
```



---

# 45. PostgreSQL Repository Pattern

For example:

```text
modules/catalog/product/product.repository.ts
```

handles PostgreSQL operations through Prisma.

Conceptually:

```text
class ProductRepository {
    findById()
    findBySlug()
    findByVendor()
    findMany()
    create()
    update()
    archive()
}
```

The class implements the repository contract defined by the module.

Then:

```text
ProductService
```

uses the repository abstraction, not Prisma directly.

This makes testing easier and prevents database queries from spreading throughout the application.

The important dependency rule is:

```text
Service
   ↓
Repository contract
   ↓
Repository class
   ↓
Prisma
   ↓
PostgreSQL
```



---

# 46. Don't Put Prisma Types Everywhere

This is subtle but important.

We shouldn't make every frontend component know about:

```text
Prisma generated types
Database row structure
Prisma-specific relations
```

Keep database representation separated from application/domain representation.

For example:

```text
PostgreSQL
    ↓
Prisma
    ↓
Repository class
    ↓
Domain/Application object
    ↓
Service class
    ↓
Response DTO
    ↓
UI
```

The database schema is an implementation detail of the persistence layer.



---

# 47. API Response DTOs

Don't automatically return raw Prisma records.

For example, don't expose:

```text
{
  _id,
  passwordHash,
  internalFlags,
  ...
}
```

Instead create a safe response shape.

For example:

```text
ProductResponse
{
    id
    name
    slug
    price
    images
    vendor
}
```

This protects internal implementation details.

---

# 48. Validation Strategy

We should validate at multiple levels.

### Frontend

For user experience:

```text
Required fields
Format
Length
Basic validation
```

### Backend

For security and correctness:

```text
Required fields
Types
Ranges
Business rules
Authorization
```

### Database

For:

```text
Unique indexes
Data consistency
```

Never rely on frontend validation alone.

---

# 49. Naming Conventions

I recommend one naming convention throughout the project.

### Files

Use:

```text
product.service.ts
product.repository.ts
product.types.ts
```

rather than:

```text
ProductService.ts
ProductRepository.ts
```

### React components

Use:

```text
ProductCard.tsx
CartSummary.tsx
OrderTimeline.tsx
```

### Functions

Use:

```text
createProduct()
getProductById()
reserveInventory()
```

### Variables

Use:

```text
productId
vendorId
orderId
```

### Database tables / Prisma models

Use:

```text
products
orders
vendor_orders
```

Consistency matters more than the specific convention.

---

# 50. Engineering Standards

The repository should have explicit engineering standards instead of relying on unwritten conventions.

Create:

```text
docs/engineering/standards.md
```

At minimum, it should define:

```text
1. TypeScript rules
2. Functional React/Next.js UI rules
3. Class-based service rules
4. Class-based repository rules
5. Contracts-first workflow
6. DTO conventions
7. Module boundary rules
8. Dependency direction
9. Validation rules
10. Error handling
11. Logging
12. Testing
13. Naming
14. Database access
15. Git conventions
```

The most important style rule is:

```text
UI / framework code
    → functional

Services
    → classes

Repositories
    → classes
```

This is intentional rather than accidental.

---

# 51. Architecture Decision Records (ADRs)

Important architectural choices should be recorded as ADRs.

Store them under:

```text
docs/architecture/adr/
```

Initial ADRs:

```text
ADR-001 — Next.js native full-stack application
ADR-002 — PostgreSQL with Prisma
ADR-003 — Modular monolith and module boundaries
ADR-004 — Hybrid TypeScript style
ADR-005 — Contracts-first development
ADR-006 — Composition root and dependency wiring
```

Each ADR should contain:

```text
Context
Decision
Alternatives considered
Consequences
Status
```

The goal is not bureaucracy. The goal is to prevent important architectural decisions from disappearing into chat messages or individual developers' memory.

---

# 52. Git Structure

Keep commits meaningful.

Bad:

```text
update
changes
final
final2
```

Good:

```text
feat(auth): add customer registration
feat(auth): add vendor registration
feat(product): add vendor product creation
feat(cart): add cart item management
feat(order): create order engine
fix(inventory): prevent negative stock
```

A new developer can understand project history.

---

# 53. Documentation Structure

The repository should contain:

```text
docs/
├── architecture/
│   ├── overview.md
│   └── adr/
│       ├── ADR-001-nextjs-native-fullstack.md
│       ├── ADR-002-postgresql-prisma.md
│       ├── ADR-003-modular-monolith.md
│       ├── ADR-004-hybrid-typescript-style.md
│       ├── ADR-005-contracts-first.md
│       └── ADR-006-composition-root.md
│
├── business/
│   ├── customer-flow.md
│   ├── vendor-flow.md
│   └── order-lifecycle.md
│
├── database/
│   └── schema.md
│
├── api/
│   └── conventions.md
│
└── engineering/
    ├── standards.md
    ├── module-boundaries.md
    └── development-workflow.md
```

This is extremely useful when another developer joins.

---

# 54. README

The root `README.md` should answer:

```text
What is this project?

What technology is used?

How do I install it?

How do I run it?

How do I configure PostgreSQL and Prisma?

How is the project structured?

How do I run tests?

Where is the API documentation?

What is the development workflow?
```

A new developer should be able to go from:

```text
Git clone
   ↓
README
   ↓
Environment
   ↓
npm install
   ↓
PostgreSQL
   ↓
npm run dev
```

and understand how to start working.

---

# 55. The Development Rules I Want Us to Follow

These are the most important best practices.

### Rule 1

**Business logic belongs in modules.**

Not in pages.

---

### Rule 2

**Database logic belongs in repositories.**

Not in React components.

---

### Rule 3

**Route handlers should be thin.**

They should coordinate:

```text
Request
 ↓
Auth
 ↓
Validation
 ↓
Service
 ↓
Response
```

---

### Rule 4

**Services contain business rules.**

For example:

```text
Can this vendor accept this order?
```

belongs in the service.

---

### Rule 5

**Repositories contain PostgreSQL operations.**

For example:

```text
findById()
findMany()
create()
update()
delete()
```

implemented through Prisma belongs there.

The repository is a class that implements the module's repository contract.

---

### Rule 6

**Frontend does not own business truth.**

The backend decides:

```text
price
stock
order total
permissions
order status
payment state
```

---

### Rule 7

**Never trust the client.**

Everything important is validated server-side.

---

### Rule 8

**Don't make everything reusable prematurely.**

Build reusable components when there is an actual reason.

Avoid creating abstractions just because they "might be useful someday."

---

### Rule 9

**Don't build microservices prematurely.**

Our first version should be:

```text
Next.js native full-stack
+
PostgreSQL + Prisma
+
Modular monolith
+
Clean module boundaries
```

Later we can extract a module only if real business or operational needs justify it.

---

### Rule 10

**Every module should have a clear owner.**

For example:

```text
Product → Catalog
Inventory → Inventory
Order → Order
Payment → Payment
```

Don't have five modules modifying the same business state independently.

---

# 56. Our PostgreSQL Design Principle

PostgreSQL gives us relational modeling, transactions, foreign keys, unique constraints, and explicit relationships.

We should model the business domain relationally rather than treating PostgreSQL like a document store.

For example:

```text
Customer
   ↓
Orders
   ↓
Order Items
   ↓
Products / Variants
```

and:

```text
Order
   ↓
Vendor Orders
   ↓
Vendor
```

Use PostgreSQL features where they represent real business invariants:

```text
Foreign keys
Unique constraints
Check constraints where useful
Transactions
Indexes
Explicit one-to-one / one-to-many / many-to-many relationships
```

Query patterns still matter.

For example, a customer frequently asks:

```text
"Show me my orders."
```

So the order repository should support efficient queries around:

```text
customerId + createdAt
```

A vendor frequently asks:

```text
"Show me my pending orders."
```

So the repository should efficiently query around:

```text
vendorId + status + createdAt
```

Indexes should be designed from actual access patterns rather than added to every column.

---

# 57. The First Database Tables

For our current scope, the Prisma schema should model approximately these tables:

```text
users
customer_profiles
vendor_profiles
addresses

categories
products
product_variants
product_images

inventory
inventory_movements

carts
cart_items

orders
order_items
vendor_orders
order_status_history

payments
payment_transactions

shipments
tracking_events

notifications
```

No Admin tables are needed right now.

And importantly, **we shouldn't implement all of these on Day 1**.

We create each table/model as its respective module is implemented.

---

# 58. How We Will Add Admin Later

When we eventually reach Admin, the architecture should become:

```text
src/app/
│
├── (storefront)/
├── (auth)/
├── vendor/
└── admin/       ← added later
```

and:

```text
src/modules/
│
├── auth/
├── customer/
├── vendor/
├── catalog/
├── inventory/
├── cart/
├── checkout/
├── order/
├── payment/
├── shipment/
├── notification/
└── admin/       ← added later
```

We don't need to rewrite:

```text
Product
Order
Vendor
Customer
Inventory
```

just because Admin was added.

That's exactly why we're designing the application this way.

---

# 59. The Mental Model for a New Developer

If someone joins the project six months from now, I want them to understand:

```text
"I need to change how products work."
          ↓
src/modules/catalog/product/
```

If they need:

```text
"I need to change order behavior."
          ↓
src/modules/order/
```

If they need:

```text
"I need to change PostgreSQL connection."
          ↓
src/lib/db/
```

If they need:

```text
"I need to change the customer product page."
          ↓
src/app/(storefront)/products/
```

If they need:

```text
"I need to change the ProductCard."
          ↓
src/components/product/
```

That is what a good structure should accomplish.

---

# 60. The Architecture in One Picture

```text
                         NEXT.JS
                            │
          ┌─────────────────┴─────────────────┐
          │                                   │
       UI / APP                           SERVER SIDE
          │                                   │
          ↓                                   ↓
 Functional React                    Route Handlers /
 Server Components                   Server Actions
 Client Components                          │
          │                                  ↓
          │                           DTO + Validation
          │                                  │
          │                                  ↓
          │                          Service Contract
          │                                  │
          │                                  ↓
          │                            Service Class
          │                                  │
          │                                  ↓
          │                          Repository Contract
          │                                  │
          │                                  ↓
          │                           Repository Class
          │                                  │
          │                                  ↓
          │                              Prisma
          │                                  │
          │                                  ↓
          │                             PostgreSQL
          │
          ↓
     components/
```

And the business side remains modular:

```text
                         MODULAR MONOLITH
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
      Catalog                 Order                 Vendor
        │                       │                       │
    Inventory                Payment               Customer
        │                       │                       │
      Cart                   Shipment                Auth
                                │
                         Notification
```

The composition root wires the concrete implementations:

```text
Prisma
   ↓
Repositories
   ↓
Services
   ↓
Module public APIs
```

The application remains one deployable Next.js system until real business needs justify extraction.


---

# 61. One Thing I Would Change From Our Previous Roadmap

We previously listed **18 development steps**.

We should now map them directly to the Next.js structure:

```text
01 Foundation
   └── app + lib + config

02 Identity
   └── modules/auth

03 Profiles
   ├── modules/customer
   └── modules/vendor

04 Vendor Products
   └── modules/catalog/product

05 Catalog
   └── modules/catalog

06 Inventory
   └── modules/inventory

07 Cart
   └── modules/cart

08 Checkout
   └── modules/checkout

09 Orders
   └── modules/order

10 Vendor Order Management
   └── modules/order + vendor

11 Order State
   └── modules/order

12 Payment
   └── modules/payment

13 Shipping
   └── modules/shipment

14 Notifications
   └── modules/notification

15 Customer Orders
   └── app/(storefront)/orders

16 Vendor Dashboard
   └── app/vendor

17 Security
   └── lib/auth + module authorization

18 Testing/Deployment
   └── tests + infrastructure
```

That gives us a very clean connection between **our business roadmap** and **our source code**.

---

# 62. The Final Principle

Reddy, I would keep one architectural rule above everything else:

> **The UI should be replaceable. The database should be replaceable. External providers should be replaceable. Business rules should remain independent.**

So instead of coupling everything directly:

```text
React
  ↓
Prisma
  ↓
PostgreSQL
```

we want:

```text
                     UI
                      │
                      ↓
             Next.js application
                      │
          ┌───────────┴───────────┐
          │                       │
   Server Components       Route Handlers /
   Client Components       Server Actions
          │                       │
          └───────────┬───────────┘
                      ↓
                Input DTOs
                      ↓
                 Validation
                      ↓
              Service Contract
                      ↓
                Service Class
                      ↓
             Repository Contract
                      ↓
               Repository Class
                      ↓
                   Prisma
                      ↓
                PostgreSQL
```

The composition root owns the concrete wiring:

```text
Prisma
   ↓
Repository implementations
   ↓
Service implementations
   ↓
Module public APIs
```

The business modules remain independent from the UI and from Prisma-specific details.

Then later:

```text
Payment Provider A
        ↓
Payment Module
        ↓
Order Module
```

can become:

```text
Payment Provider B
        ↓
Payment Module
        ↓
Order Module
```

without rewriting order business rules.

And if a real business need eventually justifies extraction:

```text
Current:
Next.js Modular Monolith
        │
        ├── Payment Module
        ├── Order Module
        └── Inventory Module

Possible future:
Payment Service
Order Service
Inventory Service
```

the clean module contracts make that transition possible.

We do **not** pay the complexity cost of microservices before we need them.

---

## Our next step

Now that we've chosen **Next.js + TypeScript + PostgreSQL + Prisma** and established the folder architecture, I recommend we **do not start writing random code yet**.

We should start with **Step 1 — Project Foundation**, and design it completely before implementing it:

```text
STEP 1 — PROJECT FOUNDATION

1. Exact project initialization
2. Next.js configuration
3. TypeScript configuration
4. Folder creation
5. PostgreSQL + Prisma connection architecture
6. Environment variables
7. Error handling architecture
8. API response architecture
9. Logging
10. Contract definitions
11. DTO conventions
12. Validation setup
13. Composition root
14. Module boundaries
15. ADR structure
16. Engineering standards
17. ESLint / Prettier
18. Git configuration
19. Naming conventions
20. Import/path aliases
21. Development scripts
22. README structure
23. Initial PostgreSQL + Prisma strategy
24. Testing foundation
25. Security foundation
26. Step-1 completion checklist
```

Then we can actually build **Step 1 from zero**, file by file, and I can explain **what every folder and file is doing and why it exists**, rather than dumping a huge codebase on you.
