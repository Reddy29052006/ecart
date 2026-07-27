# ADR 0002: Multi-Role User Identity and Two-Phase Role Selection Login

## Status
**Accepted**

## Context
In our e-commerce platform, a user may want to act as both a **Customer** (purchasing products) and a **Vendor** (selling products) using a single email address. Creating separate `User` identity records for each role under the same email causes duplicate accounts, password sync issues, fragmented addresses, and complex session management.

## Decision
1. **Single User Identity + Multiple Role Memberships**:
   - A single `User` record represents the person's identity (`id`, `email`, `passwordHash`, `status`).
   - The user possesses a list of assigned roles: `roles: UserRole[]` (e.g. `['CUSTOMER']`, `['VENDOR']`, or `['CUSTOMER', 'VENDOR']`).
2. **Password-Verified Multi-Role Registration**:
   - When an existing account attempts to register for the second role, the system requires password verification of the existing account before adding the new role.
3. **Two-Phase Authentication & Role Selection**:
   - **Phase 1 (`POST /api/v1/auth/login`)**: Authenticates email and password.
     - Single-role accounts immediately receive access and refresh tokens for their assigned role.
     - Dual-role accounts receive a short-lived (5 min), single-purpose `selectionToken`.
   - **Phase 2 (`POST /api/v1/auth/select-role`)**: Accepts `selectionToken` and desired `role`. Validates role ownership and issues final access/refresh tokens bound to that role context.

## Consequences
- **Security**: Separates initial identity authentication from role context authorization. Selection tokens cannot access domain APIs directly.
- **Modularity**: Domain profiles (`CustomerProfile`, `VendorProfile`) remain cleanly decoupled from authentication.
- **User Experience**: Single-role users experience seamless direct login, while dual-role users enjoy a clear role chooser without re-entering credentials.
