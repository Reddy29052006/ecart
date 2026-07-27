# ADR-005: Contract-First Development Model

## Context
Preventing tight coupling between database implementation details (e.g. Prisma generated types) and higher application/UI layers.

## Decision
Before implementing any business feature, developers must establish explicit interfaces and DTOs:
`Use Case → Input DTO → Output DTO → Service Contract → Repository Contract → Implementation`.

## Consequences
- UI and application code depend on generic domain interfaces, not Prisma client models.
- Switching persistence mechanisms or mocking repositories during unit testing becomes effortless.
