# E-Cart API — Postman Reference Guide

**Base URL:** `http://localhost:3000/api/v1`

**Auth Header (wherever required):**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

---

## 🔑 Authentication (`/auth`)
> Rate limited to prevent brute-force attacks (returns HTTP `429 Too Many Requests` on rate limit breach).

### Register as Customer
```http
POST /auth/register
```
```json
{
  "email": "customer@example.com",
  "password": "Password123"
}
```

### Register as Vendor
```http
POST /auth/vendor/register
```
```json
{
  "email": "vendor@example.com",
  "password": "Password123"
}
```
> **Note:** If the email already exists with the other role, provide your current password to link the second role. Same body format — the system handles it automatically.

### Login
```http
POST /auth/login
```
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```
- **Single-role response:** Returns `accessToken` + `refreshToken` directly inside `tokens` object.
- **Dual-role response:** Returns `requiresRoleSelection: true`, `availableRoles: ["CUSTOMER", "VENDOR"]`, and a 5-minute `selectionToken`. Call `/auth/select-role` next.

### Select Role (dual-role users only)
```http
POST /auth/select-role
```
```json
{
  "selectionToken": "<selectionToken from login response>",
  "role": "CUSTOMER"
}
```
> `role` can be `"CUSTOMER"` or `"VENDOR"`.

### Refresh Access Token
```http
POST /auth/refresh
```
```json
{
  "refreshToken": "<your refreshToken>"
}
```

### Logout
```http
POST /auth/logout
```
```json
{
  "refreshToken": "<your refreshToken>"
}
```

### Get Current User Info
```http
GET /auth/me
Authorization: Bearer <accessToken>
```
*(no body)*

---

## 👤 Customer Profile (`/customers/me`)
> All endpoints require `Authorization: Bearer <customerAccessToken>`

### Get My Profile
```http
GET /customers/me
```
*(no body)*

### Update My Profile
```http
PUT /customers/me
```
```json
{
  "firstName": "Reddy",
  "lastName": "Sekhar",
  "displayName": "ReddyS",
  "profileImage": "https://example.com/avatar.jpg"
}
```
> All fields are optional — send only what you want to update.

---

## 📍 Customer Addresses (`/customers/me/addresses`)
> All endpoints require `Authorization: Bearer <customerAccessToken>`

### List My Addresses
```http
GET /customers/me/addresses
```
*(no body)*

### Add a New Address
```http
POST /customers/me/addresses
```
```json
{
  "label": "Home",
  "fullName": "Reddy Sekhar",
  "phone": "+919876543210",
  "addressLine1": "123 Main Street",
  "addressLine2": "Flat 4B",
  "city": "Hyderabad",
  "state": "Telangana",
  "postalCode": "500001",
  "country": "IN",
  "isDefault": true
}
```
> `label`, `addressLine2`, `country`, `isDefault` are optional. First address is auto-set as default.

### Update an Address
```http
PUT /customers/me/addresses/:addressId
```
```json
{
  "fullName": "Reddy S",
  "phone": "+919999999999",
  "addressLine1": "456 New Street",
  "city": "Hyderabad",
  "state": "Telangana",
  "postalCode": "500002"
}
```
> All fields optional.

### Delete an Address
```http
DELETE /customers/me/addresses/:addressId
```
*(no body)*

### Set Default Address
```http
PATCH /customers/me/addresses/:addressId/default
```
*(no body)*

---

## 🏪 Vendor Profile (`/vendors/me`)
> All endpoints require `Authorization: Bearer <vendorAccessToken>`

### Get My Vendor Profile
```http
GET /vendors/me
```
*(no body)*

### Update My Vendor Profile
```http
PUT /vendors/me
```
```json
{
  "businessName": "Reddy Superstore",
  "businessDescription": "Quality goods at affordable prices",
  "businessPhone": "+919876543210",
  "businessEmail": "store@reddy.com",
  "logo": "https://example.com/logo.png"
}
```
> All fields optional.

### Update Vendor Status (Vendor Self-Update)
```http
PATCH /vendors/me/status
```
```json
{
  "status": "SUSPENDED"
}
```
> **Security Guard:** Vendors can only change status to `"PENDING"` or `"SUSPENDED"`. Attempting to self-approve/activate status to `"ACTIVE"` is blocked and returns `403 Forbidden`.

### Activate Vendor Account (Admin Only)
```http
POST /vendors/:userId/activate
x-admin-secret: admin-secret-key
```
*(no body)*
> **Administrative Authorization Required:** Requires header `x-admin-secret: admin-secret-key` or an authenticated `ADMIN` role.

---

## 📂 Categories (`/categories`)

### List All Categories
```http
GET /categories
```
*(no body, no auth required)*

### Create a Category
```http
POST /categories
```
```json
{
  "name": "Electronics",
  "description": "Phones, laptops, and gadgets",
  "parentCategoryId": null,
  "image": "https://example.com/electronics.jpg",
  "status": "ACTIVE"
}
```
> `parentCategoryId`, `description`, `image`, `status` are optional.

---

## 🛍️ Vendor Products (`/vendors/me/products`)
> All endpoints require `Authorization: Bearer <vendorAccessToken>`

### List My Products
```http
GET /vendors/me/products
```
*(no body)*

### Create a Product
```http
POST /vendors/me/products
```
```json
{
  "categoryId": "<categoryId>",
  "name": "Nike Air Max",
  "description": "Premium running shoes",
  "brand": "Nike",
  "price": 4999,
  "stock": 0
}
```
> `description`, `brand`, `stock` are optional. Slug is auto-generated from `name`.

### Get a Specific Product
```http
GET /vendors/me/products/:productId
```
*(no body)*

### Update a Product
```http
PUT /vendors/me/products/:productId
```
```json
{
  "name": "Nike Air Max Plus",
  "price": 5499,
  "stock": 10,
  "brand": "Nike",
  "description": "Updated description"
}
```
> All fields optional.

### Change Product Status
```http
PATCH /vendors/me/products/:productId/status
```
```json
{
  "status": "ACTIVE"
}
```
> `status` can be `"DRAFT"`, `"ACTIVE"`, `"INACTIVE"`, or `"ARCHIVED"`.

---

## 🖼️ Product Images (`/vendors/me/products/:productId/images`)
> All endpoints require `Authorization: Bearer <vendorAccessToken>`

### Add an Image
```http
POST /vendors/me/products/:productId/images
```
```json
{
  "url": "https://example.com/product-front.jpg",
  "sortOrder": 0,
  "isPrimary": false
}
```
> `sortOrder` and `isPrimary` are optional. First image is auto-set as primary.

### Delete an Image
```http
DELETE /vendors/me/products/:productId/images/:imageId
```
*(no body)*

### Set Primary Image
```http
PATCH /vendors/me/products/:productId/images/:imageId/primary
```
*(no body)*

---

## 📦 Product Variants (`/vendors/me/products/:productId/variants`)
> All endpoints require `Authorization: Bearer <vendorAccessToken>`

### List Variants for a Product
```http
GET /vendors/me/products/:productId/variants
```
*(no body)*

### Create a Variant
```http
POST /vendors/me/products/:productId/variants
```
```json
{
  "sku": "TSHIRT-BLK-M",
  "price": 799,
  "status": "ACTIVE",
  "lowStockThreshold": 5,
  "attributes": [
    { "name": "Color", "value": "Black" },
    { "name": "Size", "value": "M" }
  ]
}
```
> `status`, `lowStockThreshold`, `attributes` are optional. SKU is auto-uppercased.

### Get a Single Variant
```http
GET /vendors/me/products/:productId/variants/:variantId
```
*(no body)*

### Update a Variant
```http
PUT /vendors/me/products/:productId/variants/:variantId
```
```json
{
  "sku": "TSHIRT-RED-M",
  "price": 899,
  "status": "INACTIVE",
  "lowStockThreshold": 10
}
```
> All fields optional.

### Delete a Variant
```http
DELETE /vendors/me/products/:productId/variants/:variantId
```
*(no body)*

---

## 🏭 Inventory (`/vendors/me/products/:productId/variants/:variantId`)
> All endpoints require `Authorization: Bearer <vendorAccessToken>`

### View Current Stock Levels
```http
GET /vendors/me/products/:productId/variants/:variantId/inventory
```
*(no body)*

**Response includes:**
- `availableQuantity` — physical units in stock
- `reservedQuantity` — held by pending orders
- `sellableQuantity` — `available - reserved`

### Add Stock (STOCK_IN)
```http
POST /vendors/me/products/:productId/variants/:variantId/stock
```
```json
{
  "quantity": 50,
  "note": "Supplier delivery batch #3",
  "referenceType": "PURCHASE_ORDER",
  "referenceId": "PO-2024-001"
}
```
> Only `quantity` is required (must be ≥ 1). Rest are optional.

### Adjust Stock (Correction)
```http
POST /vendors/me/products/:productId/variants/:variantId/adjust
```
```json
{
  "quantity": -3,
  "note": "Damaged units removed after inspection"
}
```
> `quantity` can be **positive or negative**. Cannot reduce stock below zero. `note` is optional.

### View Stock Movement History
```http
GET /vendors/me/products/:productId/variants/:variantId/movements
```
*(no body)*

---

## 🛒 Shopping Cart (`/cart`)
> All endpoints require `Authorization: Bearer <customerAccessToken>`

### View Shopping Cart
```http
GET /cart
```
*(no body)*

**Response Format:**
```json
{
  "success": true,
  "message": "Cart retrieved",
  "data": {
    "id": "cm...",
    "customerProfileId": "cm...",
    "items": [
      {
        "id": "cm...",
        "quantity": 2,
        "variant": {
          "id": "cm...",
          "sku": "TSHIRT-BLK-M",
          "price": 799,
          "status": "ACTIVE",
          "product": {
            "id": "cm...",
            "name": "Classic T-Shirt",
            "status": "ACTIVE",
            "images": [{ "url": "https://example.com/shirt.jpg", "isPrimary": true }]
          },
          "attributes": [{ "name": "Color", "value": "Black" }],
          "inventory": { "availableQuantity": 50, "reservedQuantity": 2 }
        }
      }
    ],
    "itemCount": 1,
    "subtotal": 1598
  }
}
```

### Add Item to Cart (or Increment Quantity)
```http
POST /cart/items
```
```json
{
  "variantId": "<productVariantId>",
  "quantity": 2
}
```
> If variant is already in cart, increases quantity by `quantity`. Validates active product, active variant, active vendor, and available stock.

### Update Cart Item Quantity
```http
PUT /cart/items/:itemId
```
```json
{
  "quantity": 5
}
```
> Setting `quantity: 0` removes the item from the cart.

### Remove Single Item from Cart
```http
DELETE /cart/items/:itemId
```
*(no body)*

### Clear Entire Cart
```http
DELETE /cart
```
*(no body)*

---

## 💳 Checkout Order Preview (`/cart/checkout/preview`)
> Endpoints require `Authorization: Bearer <customerAccessToken>`

### Generate Order Preview (8-Gate Validation Pipeline)
```http
POST /cart/checkout/preview
```
```json
{
  "addressId": "<addressId>"
}
```

> **Read-Only / Idempotent Pipeline:** Performs 8 strict integrity checks before returning order preview. No database orders or payments are created until order submission (Stage 9).

#### 8-Gate Validation Pipeline Checks:
1. **Gate 1 — Customer Profile Check:** Verifies customer profile exists for user.
2. **Gate 2 — Delivery Address Check:** Verifies address exists and belongs to customer.
3. **Gate 3 — Cart Integrity Check:** Verifies cart is non-empty and active.
4. **Gate 4 — Product Status Check:** Verifies every product is `"ACTIVE"`.
5. **Gate 5 — Product Variant Status Check:** Verifies every variant is `"ACTIVE"`.
6. **Gate 6 — Vendor Status Check:** Verifies vendor status is `"ACTIVE"`.
7. **Gate 7 — Price Integrity Check:** Re-fetches price directly from database variants to prevent client-side price tampering.
8. **Gate 8 — Stock Availability Check:** Verifies `sellableQuantity >= cartQuantity`.

**Sample Response Format:**
```json
{
  "success": true,
  "message": "Order preview generated",
  "data": {
    "items": [
      {
        "cartItemId": "cm...",
        "variantId": "cm...",
        "productId": "cm...",
        "vendorId": "cm...",
        "productName": "Nike Air Max",
        "sku": "NIKE-AIR-MAX-BLK-42",
        "unitPrice": 4999,
        "quantity": 2,
        "totalPrice": 9998,
        "variantAttributes": [
          { "name": "Color", "value": "Black" },
          { "name": "Size", "value": "42" }
        ],
        "productImage": "https://example.com/shoe.jpg"
      }
    ],
    "pricing": {
      "lineItems": [
        {
          "variantId": "cm...",
          "unitPrice": 4999,
          "quantity": 2,
          "totalPrice": 9998
        }
      ],
      "subtotal": 9998,
      "shippingAmount": 0,
      "taxAmount": 0,
      "discountAmount": 0,
      "grandTotal": 9998,
      "currency": "INR"
    },
    "deliveryAddress": {
      "fullName": "Reddy Sekhar",
      "phone": "+919876543210",
      "addressLine1": "123 Main Street",
      "addressLine2": "Flat 4B",
      "city": "Hyderabad",
      "state": "Telangana",
      "postalCode": "500001",
      "country": "IN"
    },
    "isReadyForOrder": true
  }
}
```

---

## 🔍 Public Product Catalog (`/products`)
> No authentication required

### Browse / Search Products
```http
GET /products
```

**Query Parameters (all optional):**

| Parameter | Type | Example | Description |
|---|---|---|---|
| `search` | string | `running shoes` | Keyword search across name, description, brand |
| `categoryId` | string | `cms3ed41t...` | Filter by category ID |
| `categorySlug` | string | `footwear-shoes` | Filter by category slug |
| `brand` | string | `Nike` | Filter by brand (case-insensitive) |
| `minPrice` | number | `500` | Minimum price |
| `maxPrice` | number | `5000` | Maximum price |
| `inStock` | boolean | `true` | Only show products with sellable stock > 0 |
| `sortBy` | string | `price_asc` | `price_asc`, `price_desc`, `newest` |
| `page` | number | `1` | Page number |
| `pageSize` | number | `10` | Items per page (max 50) |

---

### Get Product Detail by Slug or ID
```http
GET /products/:slugOrId
```
*(no auth, no body)*

**Response includes:** full product details + all images + category info + vendor info + `inStock: true/false`

---

## 🏥 Health Check

### Server & Database Health
```http
GET /health
```
*(no auth, no body)*

---

## 📋 Quick Reference — HTTP Methods Summary

| Module | GET | POST | PUT | PATCH | DELETE |
|---|---|---|---|---|---|
| **Auth** | `/auth/me` | `/auth/register`<br>`/auth/vendor/register`<br>`/auth/login`<br>`/auth/logout`<br>`/auth/refresh`<br>`/auth/select-role` | — | — | — |
| **Customer Profile** | `/customers/me` | — | `/customers/me` | — | — |
| **Customer Addresses** | `/customers/me/addresses` | `/customers/me/addresses` | `/customers/me/addresses/:id` | `/customers/me/addresses/:id/default` | `/customers/me/addresses/:id` |
| **Vendor Profile** | `/vendors/me` | `/vendors/:userId/activate` *(Admin)* | `/vendors/me` | `/vendors/me/status` | — |
| **Categories** | `/categories` | `/categories` | — | — | — |
| **Vendor Products** | `/vendors/me/products`<br>`/vendors/me/products/:id` | `/vendors/me/products` | `/vendors/me/products/:id` | `/vendors/me/products/:id/status` | — |
| **Product Images** | — | `/vendors/me/products/:id/images` | — | `/vendors/me/products/:id/images/:iid/primary` | `/vendors/me/products/:id/images/:iid` |
| **Variants** | `/vendors/me/products/:id/variants`<br>`/vendors/me/products/:id/variants/:vid` | `/vendors/me/products/:id/variants` | `/vendors/me/products/:id/variants/:vid` | — | `/vendors/me/products/:id/variants/:vid` |
| **Inventory** | `/vendors/me/products/:id/variants/:vid/inventory`<br>`/vendors/me/products/:id/variants/:vid/movements` | `/vendors/me/products/:id/variants/:vid/stock`<br>`/vendors/me/products/:id/variants/:vid/adjust` | — | — | — |
| **Shopping Cart** | `/cart` | `/cart/items` | `/cart/items/:itemId` | — | `/cart/items/:itemId`<br>`/cart` |
| **Checkout Preview** | — | `/cart/checkout/preview` | — | — | — |
| **Public Catalog** | `/products`<br>`/products/:slugOrId` | — | — | — | — |
| **Health** | `/health` | — | — | — | — |
