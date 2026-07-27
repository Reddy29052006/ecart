# Module Boundary Rules

## 1. Public API Exports
Each module in `src/modules/<module-name>/` MUST expose a public contract in `index.ts`.

## 2. Prohibition of Deep Imports
- **Allowed**: `import { OrderService } from '@/modules/order';`
- **Forbidden**: `import { OrderRepository } from '@/modules/order/order.repository';`

## 3. Communication Direction
Modules must interact through public service interfaces or event handlers, never by directly reading or mutating another module's database tables.
