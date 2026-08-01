# Frontend Engineering Rules

Version: 1.0

Status: Approved

---

# 1. Purpose

This document defines the engineering rules governing frontend development for this project.

It is the single source of truth for frontend architecture, engineering conventions, implementation constraints, and quality standards.

Implementation stages are defined separately in `frontendStages.md`.

Project architecture is defined separately in `frontendStructure.md`.

---

# 2. Core Principles

The frontend must:

- integrate with the existing backend
- remain replaceable
- remain modular
- remain maintainable
- remain type-safe
- remain accessible
- remain responsive
- follow the existing application architecture

The frontend is **not** an independent application.

It is one layer of the existing Next.js modular monolith.

---

# 3. Source of Truth

Before implementing any frontend feature, always inspect:

- projectStages.md
- projectStructure.md
- frontendStages.md
- frontendStructure.md

Then inspect the existing implementation.

Documentation takes precedence over assumptions.

---

# 4. Incremental Development

Frontend development must be performed one stage at a time.

Every stage follows:

```text
Read

↓

Plan

↓

Implement

↓

Test

↓

Audit

↓

STOP

↓

Wait for Approval
```

Never automatically continue to another stage.

---

# 5. Existing Backend Is Authoritative

The frontend integrates with the existing backend.

Do not rebuild backend capabilities.

Do not create duplicate business logic.

Before implementing any feature:

```text
Read API

↓

Read DTO

↓

Read Validation

↓

Read Response Contract

↓

Read Error Contract

↓

Implement UI
```

If the backend capability does not exist:

Stop.

Document:

- missing API
- required DTO
- required response
- reason

Do not invent production APIs.

---

# 6. Next.js Native Architecture

The application uses:

- Next.js
- React
- TypeScript
- App Router

Do not introduce:

- Express
- NestJS
- Fastify
- Backend-for-Frontend
- Separate frontend project

unless explicitly documented.

---

# 7. Dependency Direction

The frontend must follow:

```text
UI

↓

Application API

↓

Route Handler / Server Action

↓

DTO + Validation

↓

Application Service

↓

Repository

↓

Prisma

↓

PostgreSQL
```

Never bypass application boundaries.

---

# 8. Forbidden Dependencies

Never allow:

```text
UI

↓

Prisma
```

Never allow:

```text
UI

↓

Repository
```

Never allow:

```text
React Component

↓

Database
```

Never put business rules inside React components.

---

# 9. React Architecture

Use:

- functional components
- hooks
- composition
- Server Components
- Client Components only when required

Never use:

- class components

---

# 10. Server Components

Prefer Server Components by default.

Use Client Components only for:

- user interaction
- browser APIs
- local UI state
- event handlers
- interactive forms

Avoid unnecessary client rendering.

---

# 11. Hybrid TypeScript Rule

Frontend:

Functional

Backend:

Classes

Specifically:

```text
Pages

Layouts

Components

Hooks

↓

Functional


Services

Repositories

↓

Classes
```

---

# 12. Design System

UI must use reusable primitives.

Hierarchy:

```text
UI Primitives

↓

Generic Components

↓

Business Components
```

Example:

```text
Button

↓

Card

↓

ProductCard

↓

VendorProductTable
```

Do not over-abstract.

Reuse only when genuine reuse exists.

---

# 13. Styling Rules

Use the project's approved styling system only.

Design must maintain:

- consistent spacing
- typography
- colors
- shadows
- border radius
- layout widths
- responsive behavior

Do not introduce random styling.

---

# 14. Approved Libraries

Only approved libraries may be introduced.

Approved UI stack:

- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- Lucide React
- next-themes

Additional libraries require explicit approval.

---

# 15. Forbidden Libraries

Do not introduce UI frameworks without approval.

Examples:

- Material UI
- Chakra UI
- Ant Design
- Bootstrap
- MobX
- Redux
- SWR
- Axios

unless documented as approved.

---

# 16. State Management

Use only the approved state management approach.

Do not introduce additional global state libraries.

Global state should remain minimal.

Server state belongs on the server whenever possible.

---

# 17. Forms

All forms must support:

- validation
- loading
- success
- server errors
- client errors
- disabled submission

Use the approved form library consistently.

---

# 18. Data Fetching

Prefer:

Server Components

↓

Server Actions

↓

Client fetch only when necessary

Do not scatter raw fetch logic across pages.

Centralize API clients where appropriate.

---

# 19. API Integration

Always consume existing backend contracts.

Never duplicate DTOs unnecessarily.

Never reshape backend responses inside components.

Normalize responses inside the API layer if required.

---

# 20. Authentication

Authentication state must support:

- Guest
- Customer
- Vendor

Role selection is a UI concern.

Authorization remains a backend concern.

---

# 21. Authorization

Never trust:

- React state
- localStorage
- cookies alone
- hidden buttons
- URL parameters

The backend remains authoritative.

UI visibility is not authorization.

---

# 22. Real Data

Never hardcode production data.

Examples:

- products
- prices
- inventory
- vendors
- customers
- orders
- totals

Temporary mock data is allowed only for approved prototype stages.

---

# 23. Responsive Design

Every screen must support:

- mobile
- tablet
- desktop
- large desktop

Responsive behavior must be intentionally designed.

Do not simply shrink desktop layouts.

---

# 24. Accessibility

Every interactive element must support:

- keyboard navigation
- semantic HTML
- focus visibility
- labels
- screen readers
- appropriate ARIA
- color contrast
- accessible validation errors

Accessibility is mandatory.

---

# 25. UI States

Every data-driven screen must support:

- loading
- success
- empty
- error

Every important form must support:

- editing
- submitting
- validation failure
- server failure
- success

---

# 26. Performance

Prefer:

- Server Components
- streaming
- Suspense
- optimized images
- code splitting
- minimal client JavaScript

Avoid unnecessary re-renders.

---

# 27. Testing

Every completed stage should pass:

- TypeScript
- ESLint
- Build
- Relevant unit tests
- Relevant integration tests
- Relevant E2E tests

A rendered page is not considered complete.

---

# 28. Stage Completion Requirements

A stage is complete only if:

- implementation matches documentation
- backend contracts are respected
- responsive behavior verified
- accessibility verified
- loading states implemented
- error states implemented
- empty states implemented
- tests pass
- TypeScript passes
- lint passes
- build passes
- no future-stage functionality exists

---

# 29. Review Process

Every stage must produce an audit including:

- implementation summary
- changed files
- APIs used
- components created
- routes created
- tests executed
- responsive verification
- accessibility verification
- architecture compliance
- issues found
- recommendation

Status:

- PASS
- PASS WITH CONCERNS
- PARTIAL
- FAIL

---

# 30. AI Engineering Rules

When using AI:

- Read all architecture documents before implementation.
- Never invent missing backend functionality.
- Never continue beyond the approved stage.
- Never silently change project architecture.
- Prefer existing abstractions over creating new ones.
- Follow project conventions consistently.
- Stop and report ambiguities instead of guessing.

---

# 31. Definition of Done

A frontend feature is considered complete only when it is:

- Architecturally compliant
- Functionally correct
- Backend integrated
- Type-safe
- Responsive
- Accessible
- Tested
- Production ready
- Approved through stage audit

Only then may the next stage begin.
