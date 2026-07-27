# ADR-003: Modular Monolith Architecture

## Context
The platform must support clean domain segregation across multiple business capabilities (Auth, Customer, Vendor, Catalog, Inventory, Cart, Order, Payment, Shipment, Notification) while avoiding microservices overhead.

## Decision
We adopt a **Modular Monolith** structure in `src/modules/`. Each business module owns its contracts, DTOs, domain logic, and repositories.

## Consequences
- Modules communicate strictly through public contracts exposed in `src/modules/<module>/index.ts`.
- Deep internal imports into another module's internal files are prohibited.
- Solitary modules can be safely extracted into standalone microservices in the future if scale demands it.
