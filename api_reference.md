# E-Cart API — Postman Reference Guide

**Base URL:** `http://localhost:3000/api/v1`

**Auth Header (wherever required):**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

---

## 🔑 Authentication (`/auth`)

### Register as Customer
```
POST /auth/register
```
```json
{
  "email": "customer@example.com",
  "password": "Password123"
}
```

### Register as Vendor
```
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
```
POST /auth/login
```
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```
**Single-role response:** Returns `accessToken` + `refreshToken` directly.

**Dual-role response:** Returns a short-lived `selectionToken` and a `roles` array. Use `/auth/select-role` next.

### Select Role (dual-role users only)
```
POST /auth/select-role
```
```json
{
  "selectionToken": "<selectionToken from login response>",
  "role": "CUSTOMER"
}
```
> `role` can be `"CUSTOMER"` or `"VENDOR"`

### Refresh Access Token
```
POST /auth/refresh
```
```json
{
  "refreshToken": "<your refreshToken>"
}
```

### Logout
```
POST /auth/logout
```
```json
{
  "refreshToken": "<your refreshToken>"
}
```

### Get Current User Info
```
GET /auth/me
Authorization: Bearer <accessToken>
```
*(no body)*

---

## 👤 Customer Profile (`/customers/me`)
> All endpoints require `Authorization: Bearer <customerAccessToken>`

### Get My Profile
```
GET /customers/me
```
*(no body)*

### Update My Profile
```
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
```
GET /customers/me/addresses
```
*(no body)*

### Add a New Address
```
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
```
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
```
DELETE /customers/me/addresses/:addressId
```
*(no body)*

### Set Default Address
```
PATCH /customers/me/addresses/:addressId/default
```
*(no body)*

---

## 🏪 Vendor Profile (`/vendors/me`)
> All endpoints require `Authorization: Bearer <vendorAccessToken>`

### Get My Vendor Profile
```
GET /vendors/me
```
*(no body)*

### Update My Vendor Profile
```
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

### Update Vendor Status
```
PATCH /vendors/me/status
```
```json
{
  "status": "ACTIVE"
}
```
> `status` can be `"PENDING"`, `"ACTIVE"`, or `"SUSPENDED"`

### Activate Vendor Account (Dev-only, not available in production)
```
POST /vendors/:userId/activate
```
*(no body)*

---

## 📂 Categories (`/categories`)

### List All Categories
```
GET /categories
```
*(no body, no auth required)*

### Create a Category
```
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
```
GET /vendors/me/products
```
*(no body)*

### Create a Product
```
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
```
GET /vendors/me/products/:productId
```
*(no body)*

### Update a Product
```
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
```
PATCH /vendors/me/products/:productId/status
```
```json
{
  "status": "ACTIVE"
}
```
> `status` can be `"DRAFT"`, `"ACTIVE"`, `"INACTIVE"`, or `"ARCHIVED"`

---

## 🖼️ Product Images (`/vendors/me/products/:productId/images`)
> All endpoints require `Authorization: Bearer <vendorAccessToken>`

### Add an Image
```
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
```
DELETE /vendors/me/products/:productId/images/:imageId
```
*(no body)*

### Set Primary Image
```
PATCH /vendors/me/products/:productId/images/:imageId/primary
```
*(no body)*

---

## 📦 Product Variants (`/vendors/me/products/:productId/variants`)
> All endpoints require `Authorization: Bearer <vendorAccessToken>`

### List Variants for a Product
```
GET /vendors/me/products/:productId/variants
```
*(no body)*

### Create a Variant
```
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
```
GET /vendors/me/products/:productId/variants/:variantId
```
*(no body)*

### Update a Variant
```
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
```
DELETE /vendors/me/products/:productId/variants/:variantId
```
*(no body)*

---

## 🏭 Inventory (`/vendors/me/products/:productId/variants/:variantId`)
> All endpoints require `Authorization: Bearer <vendorAccessToken>`

### View Current Stock Levels
```
GET /vendors/me/products/:productId/variants/:variantId/inventory
```
*(no body)*

**Response includes:**
- `availableQuantity` — physical units in stock
- `reservedQuantity` — held by pending orders
- `sellableQuantity` — `available - reserved`

### Add Stock (STOCK_IN)
```
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
```
POST /vendors/me/products/:productId/variants/:variantId/adjust
```
```json
{
  "quantity": -3,
  "note": "Damaged units removed after inspection"
}
```
> `quantity` can be **positive or negative**. Cannot reduce stock below zero. `note` is optional but recommended.

### View Stock Movement History
```
GET /vendors/me/products/:productId/variants/:variantId/movements
```
*(no body)*

---

## 🔍 Public Product Catalog (`/products`)
> No authentication required

### Browse / Search Products
```
GET /products
```

**Query Parameters (all optional):**

| Parameter | Type | Example | Description |
|---|---|---|---|
| `search` | string | `running shoes` | Keyword across name, description, brand |
| `categoryId` | string | `cms3ed41t...` | Filter by category ID |
| `categorySlug` | string | `footwear-shoes` | Filter by category slug |
| `brand` | string | `Nike` | Filter by brand (case-insensitive) |
| `minPrice` | number | `500` | Minimum price |
| `maxPrice` | number | `5000` | Maximum price |
| `inStock` | boolean | `true` | Only show products with stock > 0 |
| `sortBy` | string | `price_asc` | `price_asc`, `price_desc`, `newest` |
| `page` | number | `1` | Page number |
| `pageSize` | number | `10` | Items per page (max 50) |

**Examples:**
```
GET /products?search=MacBook&sortBy=price_desc&page=1&pageSize=5
GET /products?categorySlug=footwear-shoes&inStock=true&minPrice=1000&maxPrice=6000
GET /products?brand=Nike&sortBy=price_asc
```

### Get Product Detail by Slug or ID
```
GET /products/:slugOrId
```
**Examples:**
```
GET /products/nike-air-max
GET /products/cms3ed8lj000ef5rsr2lq44pm
```
*(no auth, no body)*

**Response includes:** full product details + all images + category info + vendor info + `inStock: true/false`

---

## 🏥 Health Check

### Server & Database Health
```
GET /health
```
*(no auth, no body)*

---

## 📋 Quick Reference — HTTP Methods Summary

| Module | GET | POST | PUT | PATCH | DELETE |
|---|---|---|---|---|---|
| Auth | `/auth/me` | `/auth/register` `/auth/vendor/register` `/auth/login` `/auth/logout` `/auth/refresh` `/auth/select-role` | — | — | — |
| Customer Profile | `/customers/me` | — | `/customers/me` | — | — |
| Customer Addresses | `/customers/me/addresses` | `/customers/me/addresses` | `/customers/me/addresses/:id` | `/customers/me/addresses/:id/default` | `/customers/me/addresses/:id` |
| Vendor Profile | `/vendors/me` | — | `/vendors/me` | `/vendors/me/status` | — |
| Categories | `/categories` | `/categories` | — | — | — |
| Vendor Products | `/vendors/me/products` `/vendors/me/products/:id` | `/vendors/me/products` | `/vendors/me/products/:id` | `/vendors/me/products/:id/status` | — |
| Product Images | — | `/vendors/me/products/:id/images` | — | `/vendors/me/products/:id/images/:iid/primary` | `/vendors/me/products/:id/images/:iid` |
| Variants | `/vendors/me/products/:id/variants` `/vendors/me/products/:id/variants/:vid` | `/vendors/me/products/:id/variants` | `/vendors/me/products/:id/variants/:vid` | — | `/vendors/me/products/:id/variants/:vid` |
| Inventory | `/vendors/me/products/:id/variants/:vid/inventory` `/vendors/me/products/:id/variants/:vid/movements` | `/vendors/me/products/:id/variants/:vid/stock` `/vendors/me/products/:id/variants/:vid/adjust` | — | — | — |
| Public Catalog | `/products` `/products/:slugOrId` | — | — | — | — |
| Health | `/health` | — | — | — | — |
