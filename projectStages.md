For the first version, our world is simply:

```text
                    E-COMMERCE PLATFORM
                           │
                ┌──────────┴──────────┐
                │                     │
             CUSTOMER              VENDOR
                │                     │
                └──────────┬──────────┘
                           │
                      CORE ENGINE
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
     Catalog            Ordering           Fulfillment
        │                  │                  │
    Inventory           Payment           Tracking
```

I would divide the complete first implementation into **18 balanced steps**.

The important part is that **each step produces a working foundation for the next step**. We don't jump around.

---

# Complete 18-Step Development Model

## The complete sequence

| Step | Module                                     | Main Result                                     |
| ---: | ------------------------------------------ | ----------------------------------------------- |
|    1 | Project Foundation                         | Application skeleton and development foundation |
|    2 | Identity & Authentication                  | Customer/Vendor accounts and login              |
|    3 | Customer & Vendor Profiles                 | Profiles, addresses, vendor information         |
|    4 | Vendor Product Management                  | Vendor can create/manage products               |
|    5 | Catalog & Product Discovery                | Customer can browse/search products             |
|    6 | Product Variants & Inventory               | Stock and SKU management                        |
|    7 | Shopping Cart                              | Customer cart                                   |
|    8 | Pricing & Checkout Preparation             | Totals, validation, checkout calculation        |
|    9 | Order Creation Engine                      | Customer can create orders                      |
|   10 | Vendor Order Management                    | Vendor receives and processes orders            |
|   11 | Order State & History                      | Complete order lifecycle/history                |
|   12 | Payment Engine                             | Payment abstraction and payment lifecycle       |
|   13 | Shipment & Tracking                        | Vendor shipping and customer tracking           |
|   14 | Notification Engine                        | Order-related notifications                     |
|   15 | Customer Order Experience                  | Customer order history/tracking UI              |
|   16 | Vendor Dashboard                           | Complete vendor operational UI                  |
|   17 | Security, Validation & Reliability         | Protect and harden the application              |
|   18 | Testing, Deployment & Extension Foundation | Production-ready basic engine                   |

This is the order I recommend.

Now let's go **pin-to-pin** through every step.

---

# STEP 1 — PROJECT FOUNDATION

### Goal

Before building any business feature, establish the application structure.

For this project, **Next.js is the full-stack application boundary**. We do not create a separate Express/Nest/Node backend at this stage.

We should be able to run:

```text
Next.js application
PostgreSQL database
```

together, with the application containing the UI, Route Handlers, Server Components, Server Actions where appropriate, application services, repositories, validation, and business modules.

---

## 1.1 Define the application

We will eventually have:

```text
ecommerce/
│
├── src/
│   ├── app/                 # Next.js UI + Route Handlers
│   ├── modules/             # Business modules
│   ├── components/          # Functional React UI
│   ├── lib/                 # Shared technical infrastructure
│   └── composition-root.ts  # Dependency wiring
│
├── prisma/                  # PostgreSQL schema + migrations
├── docs/                    # Contracts, ADRs, engineering standards
├── tests/
├── scripts/
└── infrastructure/
```

The application is a **modular monolith**. Business modules have explicit boundaries so that a module can later be extracted into a separate service if real business needs justify it.

---

## 1.2 Environment configuration

Create environments:

```text
development
testing
production
```

Configuration should not be hardcoded.

For example:

```text
DATABASE_URL
JWT_SECRET
PAYMENT_PROVIDER_KEY
EMAIL_PROVIDER_KEY
FILE_STORAGE_URL
```

Secrets must never be committed to source control.

---

## 1.3 Next.js full-stack foundation

Use Next.js's native full-stack capabilities first.

Establish:

* Application startup
* Configuration loading
* PostgreSQL connection through Prisma
* Route Handlers
* Server Components
* Server Actions only where they improve the server-side application flow
* Request handling
* Response format
* Error handling
* Logging
* API versioning
* Health check
* Composition root / dependency wiring

For example:

```text
/api/v1/...
```

Do **not** introduce a separate backend framework or service unless a later business or operational requirement actually justifies it.

---

## 1.4 Standard API response

We should decide a consistent response format early.

For example:

```text
success
data
message
errors
```

Every API should behave consistently.

---

## 1.5 Error handling

Define standard errors:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
500 Internal Server Error
```

We should not let every module invent its own error format.

---

## 1.6 PostgreSQL + Prisma foundation

Set up:

* PostgreSQL database
* Prisma ORM
* Prisma schema
* Database connection
* Migration system
* Seed mechanism
* Development database
* Test database

The database is relational and should model the business relationships explicitly.

The application should not spread Prisma calls throughout business logic. Database access belongs behind repository classes and module contracts.

---

## 1.7 Logging

Create application logging from the beginning.

We should be able to identify:

```text
timestamp
request
user
module
operation
result
error
```

---

## 1.8 API documentation foundation

Set up API documentation infrastructure.

Later every endpoint should document:

```text
method
URL
authentication
request
response
validation
possible errors
```

---

## 1.9 Contracts-first design

Before implementing a module, define its contracts first.

For each feature, establish:

```text
Use case
    ↓
Input DTO
    ↓
Output DTO
    ↓
Application contract
    ↓
Repository contract
    ↓
Business rules
    ↓
Implementation
```

The implementation must satisfy the contract; the contract should not be rewritten simply to fit an implementation.

Contracts should be designed so that the UI, Route Handlers, services, and repositories do not depend on Prisma-specific types.

---

## 1.10 DTOs

Every external application boundary should use explicit DTOs.

Examples:

```text
CreateProductDto
UpdateProductDto
ProductResponseDto

CreateOrderDto
OrderResponseDto

AcceptVendorOrderDto
VendorOrderResponseDto
```

DTOs are the transport/application boundary. They are not the Prisma database models.

---

## 1.11 ADRs

Record important architectural decisions as Architecture Decision Records.

Initial ADR topics:

```text
ADR-001 Next.js native full-stack application
ADR-002 PostgreSQL with Prisma
ADR-003 Modular monolith boundaries
ADR-004 Hybrid TypeScript style
ADR-005 Contracts-first development
ADR-006 Composition root and dependency wiring
```

---

## 1.12 Engineering standards

Create project-wide engineering standards covering:

```text
TypeScript conventions
Functional React/UI rules
Class-based service/repository rules
Module boundary rules
DTO rules
Validation rules
Error handling
Naming
Testing
Logging
Database access
Dependency direction
Git conventions
```

These standards are part of the project foundation, not an afterthought.

---

## 1.13 Composition root

Create one composition root responsible for wiring application dependencies.

Conceptually:

```text
Composition Root
      │
      ├── Prisma client
      ├── Repository implementations
      ├── Service classes
      └── Module dependencies
```

Route Handlers, Server Components, and Server Actions should consume already-wired application capabilities rather than constructing repositories and services independently.

---

## 1.14 Hybrid TypeScript style

Use a deliberate hybrid style:

```text
React / Next.js UI
        ↓
Functional components
Functional hooks
Functional framework code
```

and:

```text
Application services
        ↓
Classes

Repositories
        ↓
Classes
```

Services and repositories should receive dependencies through constructors rather than creating their own infrastructure internally.

This gives us the requested combination of idiomatic React/Next.js code and explicit object-oriented business/infrastructure services.

---

## Step 1 completion criteria

We finish Step 1 only when:

* Next.js application runs
* PostgreSQL runs
* Prisma connects to PostgreSQL
* API responds
* Health endpoint works
* Error handling works
* Logging works
* Environment configuration works
* Database migrations work
* Contract definitions exist before their implementations
* DTO conventions are established
* ADR structure exists
* Engineering standards are documented
* Composition root wires the initial dependencies
* Module boundaries are documented
* Functional UI/framework and class-based service/repository conventions are established

**No e-commerce functionality yet.**

The goal of Step 1 is not only infrastructure. It establishes the rules under which every later module will be implemented.

---

# STEP 2 — IDENTITY & AUTHENTICATION

Now we create the people who use the system.

Only:

```text
CUSTOMER
VENDOR
```

No Admin.

---

# 2.1 User

Create the fundamental user account.

Conceptually:

```text
User
----
id
email
phone
passwordHash
status
emailVerified
phoneVerified
createdAt
updatedAt
```

---

# 2.2 User status

Support:

```text
ACTIVE
INACTIVE
SUSPENDED
```

Don't physically delete users casually.

---

# 2.3 Roles

Create:

```text
CUSTOMER
VENDOR
```

Keep role handling generic so we can add:

```text
ADMIN
SUPPORT
WAREHOUSE
```

later.

---

# 2.4 Registration

Customer:

```text
POST /auth/register
```

Vendor:

```text
POST /auth/vendor/register
```

Registration should validate:

* Email
* Phone
* Password
* Required fields
* Duplicate account
* Password strength

---

# 2.5 Login

Implement:

```text
Login
Logout
Access token
Refresh token
```

The exact authentication mechanism will be chosen when we select the technology stack.

---

# 2.6 Password security

Never store:

```text
password
```

Store:

```text
passwordHash
```

Implement:

* Password hashing
* Password verification
* Password reset
* Password change
* Password confirmation

---

# 2.7 Email/phone verification

Structure the system so verification can be added without changing the User entity drastically.

---

# 2.8 Authorization

Customer can access:

```text
/customer/*
```

Vendor can access:

```text
/vendor/*
```

Vendor must not access another vendor's resources.

This rule must be enforced by the backend.

---

# 2.9 Authentication middleware

Create reusable authentication mechanisms.

Every protected API should be able to identify:

```text
currentUser
currentRole
```

---

## Step 2 completion

We should be able to:

```text
Customer registers
       ↓
Customer logs in
       ↓
Customer accesses protected API
```

and:

```text
Vendor registers
       ↓
Vendor logs in
       ↓
Vendor accesses vendor API
```

---

# STEP 3 — CUSTOMER & VENDOR PROFILES

Authentication tells us **who the user is**.

Now we create what they actually own.

---

# 3.1 Customer profile

Create:

```text
CustomerProfile
---------------
userId
firstName
lastName
displayName
profileImage
```

Don't put all customer-specific information in User.

---

# 3.2 Customer address

Customer should have multiple addresses.

```text
Address
-------
id
userId
label
fullName
phone
addressLine1
addressLine2
city
state
postalCode
country
isDefault
createdAt
updatedAt
```

---

# 3.3 Address operations

Customer can:

```text
Create address
View addresses
Update address
Delete address
Set default address
```

---

# 3.4 Vendor profile

Vendor needs:

```text
VendorProfile
-------------
id
userId
businessName
businessDescription
businessPhone
businessEmail
logo
status
createdAt
updatedAt
```

---

# 3.5 Vendor status

Initially:

```text
PENDING
ACTIVE
SUSPENDED
```

Since Admin isn't being built yet, we need a development mechanism for making a vendor active.

Later Admin can own this approval process.

---

# 3.6 Vendor business information

Prepare for:

```text
Business name
Contact information
Business address
Logo
Description
```

Don't add complicated legal/tax/vendor payout systems yet.

---

# 3.7 Profile APIs

Customer:

```text
GET    /customer/profile
PUT    /customer/profile

GET    /customer/addresses
POST   /customer/addresses
PUT    /customer/addresses/{id}
DELETE /customer/addresses/{id}
```

Vendor:

```text
GET /vendor/profile
PUT /vendor/profile
```

---

## Step 3 completion

We should now have:

```text
Customer
 ├── Account
 ├── Profile
 └── Addresses

Vendor
 ├── Account
 └── Business Profile
```

---

# STEP 4 — VENDOR PRODUCT MANAGEMENT

Now the vendor can actually sell something.

This is our first real commerce module.

---

# 4.1 Categories

Create category structure.

```text
Category
--------
id
parentCategoryId
name
slug
description
image
status
createdAt
updatedAt
```

Support:

```text
Electronics
 ├── Phones
 └── Laptops

Fashion
 ├── Men
 └── Women
```

The `parentCategoryId` allows future hierarchy.

---

# 4.2 Product

Create:

```text
Product
-------
id
vendorId
categoryId
name
slug
description
brand
status
createdAt
updatedAt
```

---

# 4.3 Product lifecycle

Initially:

```text
DRAFT
ACTIVE
INACTIVE
ARCHIVED
```

---

# 4.4 Product creation

Vendor enters:

```text
Product name
Description
Category
Brand
Images
Price
Stock information
```

We will later separate variant/stock concerns properly.

---

# 4.5 Product editing

Vendor can:

```text
Create
View
Update
Deactivate
Archive
```

---

# 4.6 Product ownership

Critical security rule:

Vendor A cannot modify:

```text
Vendor B's Product
```

Every product operation must verify ownership.

---

# 4.7 Product images

Separate entity:

```text
ProductImage
------------
id
productId
url
sortOrder
isPrimary
```

Support:

```text
Upload
Delete
Reorder
Set primary image
```

---

# 4.8 Product slug

Create customer-friendly URLs:

```text
/products/nike-running-shoes
```

rather than exposing only IDs.

---

## Step 4 completion

Vendor can:

```text
Login
 ↓
Create product
 ↓
Add image
 ↓
Assign category
 ↓
Edit product
 ↓
Activate product
```

But customers haven't received the storefront yet.

---

# STEP 5 — CATALOG & PRODUCT DISCOVERY

Now customers can see what vendors created.

---

# 5.1 Product listing

Customer can:

```text
GET /products
```

Return:

```text
Product
Image
Price
Vendor
Availability
```

---

# 5.2 Category browsing

Customer can browse:

```text
Category
Subcategory
Products
```

---

# 5.3 Product details

Product page must display:

```text
Product name
Images
Description
Vendor
Price
Availability
Variants
```

---

# 5.4 Search

Basic search should support:

```text
keyword
```

Example:

```text
running shoes
```

Search across:

```text
product name
description
brand
```

Don't introduce Elasticsearch or another search engine yet.

---

# 5.5 Filters

Basic filters:

```text
Category
Price range
Brand
Availability
```

---

# 5.6 Sorting

Support:

```text
Price low → high
Price high → low
Newest
```

Later:

```text
Popularity
Rating
Best selling
```

---

# 5.7 Pagination

Never return thousands of products in one request.

Implement:

```text
page
pageSize
```

or cursor pagination.

---

# 5.8 Product availability

A customer should not be able to add an unavailable product.

---

## Step 5 completion

The customer can:

```text
Open storefront
 ↓
Browse categories
 ↓
Search
 ↓
Filter
 ↓
Sort
 ↓
Open product
```

---

# STEP 6 — PRODUCT VARIANTS & INVENTORY

Now we build a proper inventory engine.

This deserves its own step because inventory will eventually become very important.

---

# 6.1 Product variant

A product may have variants.

Example:

```text
T-Shirt

Size: M
Color: Black
```

Another:

```text
Size: L
Color: Black
```

Each sellable combination should have its own SKU.

---

# 6.2 Variant

Conceptually:

```text
ProductVariant
--------------
id
productId
sku
price
status
```

---

# 6.3 Variant attributes

We should design for:

```text
Size
Color
Material
Storage
RAM
Weight
```

without hardcoding attributes into the Product table.

---

# 6.4 SKU

Every sellable variant should have a unique SKU within the appropriate scope.

Example:

```text
TSHIRT-BLK-M
TSHIRT-BLK-L
```

---

# 6.5 Inventory

Inventory should track:

```text
variantId
availableQuantity
reservedQuantity
```

Conceptually:

```text
Available = 20
Reserved = 3
Sellable = 17
```

---

# 6.6 Inventory movements

Create:

```text
InventoryMovement
-----------------
id
variantId
type
quantity
referenceType
referenceId
createdAt
```

Types:

```text
STOCK_IN
STOCK_OUT
RESERVED
RELEASED
ADJUSTMENT
```

---

# 6.7 Vendor stock management

Vendor can:

```text
View stock
Add stock
Adjust stock
View stock movement
```

---

# 6.8 Low-stock foundation

We don't need advanced alerts yet, but we should keep room for:

```text
lowStockThreshold
```

---

## Step 6 completion

Vendor:

```text
Creates variant
 ↓
Assigns SKU
 ↓
Adds stock
```

Customer:

```text
Selects variant
 ↓
Sees availability
```

---

# STEP 7 — SHOPPING CART

Now customers can start buying.

---

# 7.1 Cart

Create:

```text
Cart
----
id
customerId
createdAt
updatedAt
```

One active cart per customer.

---

# 7.2 Cart item

```text
CartItem
--------
id
cartId
productVariantId
quantity
```

---

# 7.3 Add to cart

Customer selects:

```text
Product
Variant
Quantity
```

and adds it.

---

# 7.4 Update cart

Customer can:

```text
Increase quantity
Decrease quantity
Remove item
Clear cart
```

---

# 7.5 Cart validation

Before checkout, validate:

```text
Product still exists?
Product still active?
Variant still active?
Price still valid?
Enough stock?
Vendor still active?
```

---

# 7.6 Cart price

Cart should display calculated values but **the final order price must be recalculated during checkout**.

Never trust frontend totals.

---

# 7.7 Cart API

```text
GET    /cart
POST   /cart/items
PUT    /cart/items/{id}
DELETE /cart/items/{id}
DELETE /cart
```

---

## Step 7 completion

Customer can:

```text
Browse
 ↓
Select variant
 ↓
Add to cart
 ↓
Change quantity
 ↓
Remove items
 ↓
See totals
```

---

# STEP 8 — PRICING & CHECKOUT PREPARATION

This step prepares the transaction before creating the order.

---

# 8.1 Pricing engine

Create a central pricing calculation.

Input:

```text
Cart
```

Output:

```text
Subtotal
Shipping
Tax
Discount
Grand Total
```

Initially:

```text
Subtotal
+ Shipping
+ Tax
- Discount
= Total
```

---

# 8.2 Don't hardcode pricing

Create a service concept:

```text
PricingService
```

Later it can support:

```text
Coupon
Promotion
Vendor discount
Flash sale
Membership
```

---

# 8.3 Checkout validation

Before order creation:

```text
Validate customer
Validate cart
Validate products
Validate variants
Validate prices
Validate stock
Validate vendor status
Validate address
Calculate total
```

---

# 8.4 Shipping address snapshot preparation

When the customer checks out, the order should eventually contain a snapshot of the address.

Why?

Because the customer can change their saved address later.

The historical order shouldn't change.

---

# 8.5 Order preview

Customer should see:

```text
Products
Quantity
Price
Subtotal
Shipping
Tax
Discount
Total
Delivery Address
```

before confirming.

---

# 8.6 Checkout architecture

We should conceptually have:

```text
Cart
 ↓
Checkout
 ↓
Validation
 ↓
Price calculation
 ↓
Inventory validation
 ↓
Order creation
```

---

## Step 8 completion

We can safely calculate:

```text
"What exactly is the customer buying?"
"How much does it cost?"
"Can it be fulfilled?"
"Where should it be delivered?"
```

---

# STEP 9 — ORDER CREATION ENGINE

Now comes the heart of the system.

---

# 9.1 Order

Create:

```text
Order
-----
id
orderNumber
customerId
status
subtotal
shippingAmount
taxAmount
discountAmount
totalAmount
currency
shippingAddressSnapshot
createdAt
updatedAt
```

---

# 9.2 Order number

Generate human-friendly numbers.

Example:

```text
ORD-20260725-000001
```

Database ID and customer-facing order number should be separate concepts.

---

# 9.3 Order item

Create:

```text
OrderItem
---------
id
orderId
vendorId
productId
variantId
productNameSnapshot
skuSnapshot
unitPrice
quantity
totalPrice
```

Important:

Store snapshots.

---

# 9.4 Why snapshots?

Vendor can later change:

```text
Product name
Price
SKU
Description
```

But historical orders must remain accurate.

---

# 9.5 Multi-vendor order

This is critical.

Customer could purchase:

```text
Product A → Vendor A
Product B → Vendor B
Product C → Vendor A
```

Create:

```text
Order
 ├── VendorOrder A
 │      ├── Item A
 │      └── Item C
 │
 └── VendorOrder B
        └── Item B
```

---

# 9.6 VendorOrder

Conceptually:

```text
VendorOrder
-----------
id
orderId
vendorId
status
subtotal
shippingAmount
taxAmount
totalAmount
```

This allows each vendor to operate their own portion of the customer's order.

---

# 9.7 Inventory reservation

At order creation:

```text
Available Stock
       ↓
Reserve quantity
       ↓
Create order
```

We must carefully handle concurrent orders.

---

# 9.8 Transaction integrity

Order creation must be treated as a controlled transaction.

We don't want:

```text
Order created
but stock wasn't reserved
```

or:

```text
Stock reduced
but order wasn't created
```

---

# 9.9 Order creation flow

The final flow should be approximately:

```text
Customer confirms checkout
          ↓
Validate cart
          ↓
Validate inventory
          ↓
Calculate final prices
          ↓
Create Order
          ↓
Create OrderItems
          ↓
Create VendorOrders
          ↓
Reserve inventory
          ↓
Create payment record
          ↓
Commit
```

---

# STEP 10 — VENDOR ORDER MANAGEMENT

Now the vendor finally receives the order.

This is the feature you originally described.

---

# 10.1 Vendor order inbox

Vendor should see:

```text
New
Accepted
Processing
Ready
Shipped
Completed
Rejected
Cancelled
```

---

# 10.2 Vendor order details

Vendor should see:

```text
Order number
Items
Quantities
Variant
Customer delivery information
Vendor order total
Order date
Current status
```

---

# 10.3 Vendor must only see their items

If one customer purchases:

```text
Vendor A → Product A
Vendor B → Product B
```

Vendor A sees only:

```text
Product A
```

not Product B.

This is one of the most important authorization rules.

---

# 10.4 Accept order

Vendor:

```text
New
 ↓
Accept
```

This should change the VendorOrder state.

---

# 10.5 Reject order

Vendor can reject where business rules allow.

Require:

```text
rejection reason
```

Examples:

```text
Out of stock
Cannot fulfill
Invalid product
Other
```

---

# 10.6 Processing

Vendor:

```text
Accepted
 ↓
Processing
```

---

# 10.7 Ready

Vendor:

```text
Processing
 ↓
Ready to Ship
```

---

# 10.8 Vendor order APIs

Conceptually:

```text
GET  /vendor/orders
GET  /vendor/orders/{id}

POST /vendor/orders/{id}/accept
POST /vendor/orders/{id}/reject
POST /vendor/orders/{id}/processing
POST /vendor/orders/{id}/ready
```

---

## Step 10 completion

Customer places an order.

Vendor sees:

```text
NEW ORDER
```

Vendor accepts it.

Customer can now be informed that the vendor accepted the order.

That completes the **main business requirement you originally described**.

---

# STEP 11 — ORDER STATE & HISTORY

Now we make the order lifecycle reliable.

---

# 11.1 Define state machines

We shouldn't allow arbitrary status changes.

For example:

```text
PLACED
  ↓
CONFIRMED
  ↓
PROCESSING
  ↓
READY_TO_SHIP
  ↓
SHIPPED
  ↓
OUT_FOR_DELIVERY
  ↓
DELIVERED
```

Possible alternate states:

```text
REJECTED
CANCELLED
```

Later:

```text
RETURN_REQUESTED
RETURNED
REFUNDED
```

---

# 11.2 Valid transitions

Example:

```text
PLACED → CONFIRMED
```

allowed.

But:

```text
DELIVERED → PROCESSING
```

should not normally be allowed.

---

# 11.3 Order status history

Create:

```text
OrderStatusHistory
------------------
id
orderId
status
changedBy
comment
createdAt
```

---

# 11.4 VendorOrder status history

Because vendors have their own fulfillment lifecycle, we should also be able to track:

```text
VendorOrderStatusHistory
```

This gives us proper auditability.

---

# 11.5 Status timestamps

We should be able to know:

```text
acceptedAt
processingAt
shippedAt
deliveredAt
cancelledAt
```

Some can be derived from history rather than duplicated, depending on implementation.

---

# 11.6 Customer timeline

Eventually the customer sees:

```text
✓ Order Placed
✓ Vendor Accepted
✓ Processing
✓ Shipped
● Out for Delivery
○ Delivered
```

---

## Step 11 completion

Every important status transition is:

```text
Validated
Stored
Timestamped
Traceable
```

---

# STEP 12 — PAYMENT ENGINE

Now we create payment infrastructure.

Even if we start with one payment method, don't make the Order module dependent on a particular provider.

---

# 12.1 Payment

Create:

```text
Payment
-------
id
orderId
amount
currency
method
status
createdAt
updatedAt
```

---

# 12.2 Payment states

At minimum:

```text
PENDING
PROCESSING
PAID
FAILED
CANCELLED
REFUND_PENDING
REFUNDED
```

---

# 12.3 Payment transaction

Create a separate transaction concept.

```text
PaymentTransaction
------------------
id
paymentId
provider
providerTransactionId
amount
status
metadata
createdAt
```

---

# 12.4 Payment abstraction

Think:

```text
PaymentService
      │
      ├── Provider A
      ├── Provider B
      └── COD
```

The Order module shouldn't care which payment provider is being used.

---

# 12.5 Payment failure

We need a defined flow:

```text
Checkout
 ↓
Payment
 ↓
FAILED
 ↓
Order handling
 ↓
Inventory reservation released
```

The exact behavior will be finalized when we select the payment model.

---

# 12.6 Payment success

```text
Payment successful
       ↓
Payment = PAID
       ↓
Order confirmed
       ↓
Vendor notified
```

---

# 12.7 Payment webhooks

If the provider supports asynchronous confirmation, create a webhook layer.

Important:

Webhook requests must be verified and processed idempotently.

---

# 12.8 Idempotency

If a payment provider sends the same event twice, we should not:

```text
create two payments
create two orders
send two fulfillment commands
```

This should be designed now.

---

# STEP 13 — SHIPMENT & TRACKING

Now we implement the actual tracking system.

---

# 13.1 Shipment

Create:

```text
Shipment
--------
id
vendorOrderId
carrier
trackingNumber
status
shippedAt
deliveredAt
```

---

# 13.2 Shipment status

Basic:

```text
PENDING
SHIPPED
IN_TRANSIT
OUT_FOR_DELIVERY
DELIVERED
FAILED
```

---

# 13.3 Tracking events

Create:

```text
TrackingEvent
-------------
id
shipmentId
status
location
description
eventTime
```

Example:

```text
Shipment Created
Warehouse
Shipped
Distribution Center
In Transit
Local Hub
Out for Delivery
Delivered
```

---

# 13.4 Manual tracking first

For the basic engine, vendor can enter:

```text
Carrier
Tracking Number
```

and mark shipment status.

---

# 13.5 Provider integration later

Later:

```text
ShippingService
      │
      ├── Provider A
      ├── Provider B
      └── Provider C
```

Provider updates can automatically create tracking events.

---

# 13.6 Customer tracking

Customer should see:

```text
Order
 ↓
Vendor Order
 ↓
Shipment
 ↓
Tracking Events
```

For multi-vendor orders:

```text
Order #1001

Vendor A
  ✓ Shipped
  ✓ Delivered

Vendor B
  ✓ Processing
  ● Shipping
```

---

# STEP 14 — NOTIFICATION ENGINE

Now the system should communicate changes.

---

# 14.1 Notification entity

Create:

```text
Notification
------------
id
userId
type
title
message
read
createdAt
```

---

# 14.2 Events

Create application events such as:

```text
USER_REGISTERED
ORDER_CREATED
ORDER_CONFIRMED
ORDER_REJECTED
ORDER_PROCESSING
ORDER_SHIPPED
ORDER_OUT_FOR_DELIVERY
ORDER_DELIVERED
PAYMENT_SUCCESS
PAYMENT_FAILED
```

---

# 14.3 Notification flow

Don't do:

```text
OrderService → directly send email
```

Instead:

```text
Order status changed
       ↓
Event
       ↓
Notification module
       ↓
Email / In-app / Future SMS
```

---

# 14.4 In-app notifications

Customer:

```text
🔔 Your order has been accepted.
```

Vendor:

```text
🔔 New order received.
```

---

# 14.5 Email

Basic order emails:

```text
Account created
Order placed
Order accepted
Order rejected
Order shipped
Order delivered
Payment failed
```

---

# 14.6 Notification preferences

Prepare for:

```text
Email enabled
SMS enabled
Push enabled
```

We don't have to implement every channel now.

---

# STEP 15 — CUSTOMER ORDER EXPERIENCE

Now we make the customer side complete.

---

# 15.1 Customer order history

Customer should see:

```text
My Orders
```

with:

```text
Order Number
Date
Total
Status
```

---

# 15.2 Order details

Display:

```text
Order information
Products
Vendor
Quantity
Price
Shipping address
Payment information
Order status
```

---

# 15.3 Multi-vendor visualization

For:

```text
Order #1001
```

show:

```text
Vendor A
 ├── Product A
 └── Product C

Status: Shipped


Vendor B
 └── Product B

Status: Processing
```

---

# 15.4 Tracking page

Display:

```text
Order Placed
      ✓
Vendor Accepted
      ✓
Processing
      ✓
Shipped
      ✓
Out for Delivery
      ●
Delivered
```

---

# 15.5 Customer cancellation

Basic cancellation should be implemented with business rules.

Example:

```text
PLACED → can cancel
PROCESSING → maybe cancel
SHIPPED → cannot cancel normally
DELIVERED → cannot cancel
```

The exact rules should be configurable later.

---

# 15.6 Customer order APIs

```text
GET /customer/orders
GET /customer/orders/{id}
GET /customer/orders/{id}/tracking
POST /customer/orders/{id}/cancel
```

---

# STEP 16 — VENDOR DASHBOARD

Now we bring everything together for the vendor.

---

# 16.1 Dashboard

Show:

```text
Total Products
Active Products
Low Stock
New Orders
Pending Orders
Processing Orders
Shipped Orders
Completed Orders
```

---

# 16.2 Product management

Vendor should have:

```text
Products
 ├── All
 ├── Active
 ├── Draft
 └── Archived
```

---

# 16.3 Inventory management

Show:

```text
Product
SKU
Current stock
Reserved
Available
```

---

# 16.4 Orders

Show:

```text
New
Accepted
Processing
Ready
Shipped
Completed
Rejected
Cancelled
```

---

# 16.5 Order details

Vendor should be able to:

```text
View items
Accept
Reject
Process
Prepare
Ship
Enter tracking
```

---

# 16.6 Vendor profile

Vendor should manage:

```text
Business name
Description
Contact
Logo
Business address
```

---

# 16.7 Dashboard should NOT own business logic

The UI should call:

```text
Product API
Inventory API
Order API
Shipment API
```

Don't build a giant dashboard-specific business layer.

---

# STEP 17 — SECURITY, VALIDATION & RELIABILITY

Now we harden everything we've built.

This is not optional.

---

# 17.1 Authentication security

Check:

```text
Password hashing
Token expiration
Refresh token security
Logout
Password reset
Email verification
```

---

# 17.2 Authorization security

Test:

```text
Customer → cannot access vendor API
Vendor A → cannot access Vendor B's products
Vendor A → cannot access Vendor B's orders
Customer A → cannot access Customer B's orders
```

---

# 17.3 Input validation

Validate every API.

Never trust:

```text
Frontend
URL parameters
Request body
Headers
```

---

# 17.4 Ownership checks

Every protected resource should verify ownership.

For example:

```text
GET /vendor/products/123
```

must verify:

```text
Product 123 belongs to current vendor
```

---

# 17.5 Price security

Never trust:

```text
frontend total
frontend price
frontend discount
```

Backend recalculates.

---

# 17.6 Inventory security

Protect against:

```text
Overselling
Negative stock
Duplicate reservation
Concurrent checkout
```

---

# 17.7 Payment security

Protect:

```text
Webhook verification
Duplicate webhook
Payment replay
Incorrect amount
Incorrect order
```

---

# 17.8 Rate limiting

Protect sensitive endpoints:

```text
Login
Register
Password reset
Payment
Checkout
```

---

# 17.9 CORS / CSRF / security headers

Configure appropriate web security mechanisms based on the authentication architecture we choose.

---

# 17.10 File upload security

For product images:

```text
Allowed file types
Maximum size
Filename handling
Storage isolation
Malicious file protection
```

---

# 17.11 Audit logging

Record sensitive operations:

```text
Vendor created product
Vendor changed stock
Vendor accepted order
Vendor rejected order
Customer cancelled order
Payment status changed
Shipment status changed
```

---

# STEP 18 — TESTING, DEPLOYMENT & EXTENSION FOUNDATION

This is the final step of the **basic engine**.

We're not adding more business functionality here.

We're making what we built dependable and deployable.

---

# 18.1 Unit tests

Test individual business rules.

Examples:

```text
Price calculation
Order total
Inventory reservation
Inventory release
Status transition
Permission checks
```

---

# 18.2 Integration tests

Test modules together.

Example:

```text
Cart
 ↓
Checkout
 ↓
Order
 ↓
Inventory
```

---

# 18.3 API tests

Test:

```text
Authentication
Products
Cart
Checkout
Orders
Vendor orders
Payments
Shipments
```

---

# 18.4 End-to-end test

We should have one complete automated scenario:

```text
Vendor registers
 ↓
Vendor becomes active
 ↓
Vendor creates product
 ↓
Vendor adds stock
 ↓
Customer registers
 ↓
Customer logs in
 ↓
Customer finds product
 ↓
Customer adds to cart
 ↓
Customer checks out
 ↓
Order created
 ↓
Vendor receives order
 ↓
Vendor accepts
 ↓
Vendor processes
 ↓
Vendor ships
 ↓
Customer sees tracking
 ↓
Vendor marks delivered
 ↓
Customer sees delivered
```

If this works, our fundamental engine works.

---

# 18.5 Database backup

Prepare:

```text
Database backup
Backup retention
Restore process
```

---

# 18.6 Production logging

Production should have:

```text
Application logs
Error logs
Security logs
Payment logs
Order logs
```

---

# 18.7 Monitoring

At minimum monitor:

```text
Application health
Database health
API errors
Response time
Failed payments
Failed orders
```

---

# 18.8 Deployment environments

We should have:

```text
LOCAL
   ↓
DEVELOPMENT
   ↓
STAGING
   ↓
PRODUCTION
```

Don't develop directly against production.

---

# 18.9 Documentation

Before declaring the basic engine finished, document:

```text
Architecture
Database
API
Authentication
Order lifecycle
Vendor lifecycle
Inventory rules
Payment flow
Shipping flow
Deployment
Environment configuration
Contracts
DTOs
ADRs
Engineering standards
Module boundaries
Composition root
```

---

# The Entire System After These 18 Steps

At the end, we should have this:

```text
                         CUSTOMER
                            │
             ┌──────────────┼──────────────┐
             │              │              │
          Account         Catalog         Cart
             │              │              │
          Profile       Products           │
             │              │              │
          Address       Variants            │
                            │              │
                         Inventory           │
                            │              │
                            └──────┬───────┘
                                   │
                                CHECKOUT
                                   │
                                   ↓
                                 ORDER
                                   │
                      ┌────────────┴────────────┐
                      │                         │
                 VENDOR ORDER              VENDOR ORDER
                      │                         │
                   Vendor A                  Vendor B
                      │                         │
                   Shipment                 Shipment
                      │                         │
                   Tracking                 Tracking
                      │                         │
                      └────────────┬────────────┘
                                   │
                               CUSTOMER
                                   │
                              Order Status
                                   │
                              Notifications
```

---

# The 18 Steps in More Technical Terms

To make sure we're not missing the architectural progression:

```text
01. Foundation
        ↓
02. Identity
        ↓
03. Profiles
        ↓
04. Catalog Creation
        ↓
05. Catalog Discovery
        ↓
06. Variants + Inventory
        ↓
07. Cart
        ↓
08. Pricing + Checkout
        ↓
09. Order Engine
        ↓
10. Vendor Fulfillment
        ↓
11. State Management
        ↓
12. Payment
        ↓
13. Shipping + Tracking
        ↓
14. Notifications
        ↓
15. Customer Order Experience
        ↓
16. Vendor Dashboard
        ↓
17. Security + Reliability
        ↓
18. Testing + Deployment
```

---

# What We Are Deliberately NOT Building Yet

I want to keep this boundary very clear.

For this first project:

### ❌ Admin

Not now.

But our architecture will allow:

```text
CUSTOMER
VENDOR
ADMIN ← later
```

### ❌ Reviews

Later.

### ❌ Wishlist

Later.

### ❌ Coupons

Later.

### ❌ Returns

Later.

### ❌ Refund management

Basic payment refund state can be supported, but a full return/refund workflow comes later.

### ❌ Vendor commission

Later.

### ❌ Vendor payouts

Later.

### ❌ Multiple warehouses

Later.

### ❌ Advanced shipping integrations

Later.

### ❌ AI

Later.

### ❌ Recommendation engine

Later.

### ❌ Advanced analytics

Later.

### ❌ Microservices

Not initially.

The first version is a **modular monolith with clean module boundaries**. We only extract a module into a separate service when real business needs justify the operational and architectural cost.

---

# One Important Architectural Rule

Although we are **not implementing Admin**, we should not make assumptions that Admin will never exist.

For example, don't design:

```text
Vendor.status
```

as something only the vendor can arbitrarily change.

Instead, design the domain so that:

```text
Vendor.status
```

can eventually be changed by an authorized administrative process.

Similarly:

```text
Product.status
Order.status
User.status
```

should have proper authorization boundaries.

That means when we later introduce:

```text
Admin
```

we're adding a new actor—not rewriting the system.

---

# Modular Monolith Boundary Rule

The application is one deployable Next.js system, but it is **not one undifferentiated codebase**.

Each business module owns:

```text
Domain rules
Application use cases
DTOs
Contracts
Repository abstractions
Infrastructure implementations
Public module API
```

Other modules must depend on a module's public contract/API rather than reaching into its internal files.

This is what makes future extraction possible without designing microservices prematurely.

---

# The Core Dependency Chain

This is the order I want us to respect during implementation:

```text
Foundation
    ↓
Identity
    ↓
Profiles
    ↓
Products
    ↓
Catalog
    ↓
Inventory
    ↓
Cart
    ↓
Checkout
    ↓
Orders
    ↓
Vendor Fulfillment
    ↓
Order Lifecycle
    ↓
Payment
    ↓
Shipping
    ↓
Notifications
    ↓
Customer/Vendor UI
    ↓
Security
    ↓
Testing & Deployment
```

We should **not skip ahead**.

For example, we shouldn't build the checkout UI before we have decided how inventory reservation and order creation work.

---

# The Most Important Core Flow

If you remember only one thing from this whole plan, remember this:

```text
VENDOR
  │
  ├── Creates Product
  │
  ├── Creates Variant
  │
  └── Adds Stock
           │
           ↓
       CUSTOMER
           │
           ├── Finds Product
           ├── Selects Variant
           ├── Adds to Cart
           └── Checks Out
                    │
                    ↓
                 ORDER
                    │
             ┌──────┴──────┐
             ↓             ↓
         VENDOR A       VENDOR B
             │             │
          Accept         Accept
             │             │
         Processing    Processing
             │             │
           Ship          Ship
             │             │
         Tracking      Tracking
             │             │
         Delivered     Delivered
             │             │
             └──────┬──────┘
                    ↓
                COMPLETED
```

That is the **minimum viable business engine**.

Everything else we add later should plug into this rather than corrupting it.

---

# Our Development Contract

For the actual development, I recommend that we treat these 18 steps as our **master roadmap**.

The architectural rules for every step are:

```text
Contracts first
DTOs at boundaries
Functional UI/framework code
Class-based services
Class-based repositories
Explicit module boundaries
Next.js native full-stack capabilities first
PostgreSQL + Prisma behind repositories
Composition root for dependency wiring
No premature microservices
```

We will work like this:

```text
STEP 1
   ↓
Design it completely
   ↓
Implement it
   ↓
Test it
   ↓
Verify it
   ↓
Only then
   ↓
STEP 2
```

And for **each step**, before writing code, we will go one level deeper and define the contracts first:

```text
Module boundary
    ↓
Use cases
    ↓
Input DTOs
    ↓
Output DTOs
    ↓
Application contracts
    ↓
Repository contracts
    ↓
Entities
    ↓
Fields
    ↓
Relationships
    ↓
Business rules
    ↓
User flows
    ↓
API endpoints
    ↓
Validation
    ↓
Authorization
    ↓
Error cases
    ↓
Database operations
    ↓
Frontend screens
    ↓
Frontend components
    ↓
State management
    ↓
Tests
    ↓
Implementation
    ↓
Completion criteria
```

The implementation comes **after the contracts**. The UI remains functional/framework-oriented, while services and repositories are implemented as classes behind those contracts.


