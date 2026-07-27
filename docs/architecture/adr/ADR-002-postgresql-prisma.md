# ADR-002: PostgreSQL Database with Prisma ORM

## Context
E-commerce domains (orders, catalog, inventory, payments, customers) require strong relational integrity, ACID transaction guarantees, and complex query capabilities.

## Decision
We select **PostgreSQL** as the primary relational database engine, managed through **Prisma ORM** for schema definition, database migrations, and type-safe query building.

## Rules
- Raw database queries or direct Prisma instantiation inside UI components or Route Handlers is strictly forbidden.
- All database interactions MUST be encapsulated behind Repository classes.

## Consequences
- Strict relational constraints ensure financial and inventory data integrity.
- Type safety from Prisma models up to repository layers.
