# ADR-006: Composition Root & Centralized Dependency Wiring

## Context
Randomly instantiating repositories or services (`new OrderService()`, `new PrismaClient()`) across route handlers leads to hidden dependencies and testing friction.

## Decision
We enforce a centralized **Composition Root** located at `src/composition-root.ts`. All repository instances, services, and external provider instances are created, wired, and managed in one place.

## Consequences
- Route handlers retrieve pre-wired services from the composition root container.
- Dependency lifetimes and singletons are managed systematically.
