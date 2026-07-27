# Engineering Standards

## 1. Naming Conventions
- **Files & Folders**: kebab-case (e.g. `order.service.ts`, `api-response.ts`).
- **Types & Interfaces**: PascalCase (e.g. `CreateOrderDto`, `IOrderRepository`).
- **Variables & Functions**: camelCase (e.g. `calculateSubtotal()`).
- **Classes**: PascalCase (e.g. `OrderService`, `PrismaOrderRepository`).

## 2. API Response & Error Handling
- All API routes MUST use `ApiResponse.success(data)` or return standard error envelopes via `handleApiError(error)`.
- Use custom sub-classes of `AppError` (`BadRequestError`, `NotFoundError`, `UnauthorizedError`, `ValidationError`).

## 3. Database Rules
- Direct raw queries outside repository classes are forbidden.
- Prisma types must not be exposed outside their home module boundaries. Use DTOs instead.
