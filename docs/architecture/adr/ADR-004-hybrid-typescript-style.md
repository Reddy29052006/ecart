# ADR-004: Hybrid TypeScript Programming Style

## Context
Combining idiomatic React/Next.js functional paradigms with clear object-oriented dependency management in business logic.

## Decision
We enforce a hybrid style:
- **Functional Style**: React UI components, custom hooks, Next.js Server Actions, and pure utility functions.
- **Class-Based Style**: Application Services, Domain Services, Repositories, Providers, and Infrastructure Adapters.

## Consequences
- Clean separation of concerns.
- Constructor-based dependency injection in services and repositories simplifies unit testing and mocking.
