# ADR-001: Next.js Native Full-Stack Application Architecture

## Context
The e-commerce platform requires a robust, performant application boundary to serve frontend UI and process backend API requests efficiently without premature infrastructure overhead.

## Decision
We choose **Next.js (App Router, Server Components, Route Handlers)** as the single full-stack application boundary. We will NOT deploy a separate Express/NestJS/Fastify backend service in the initial phase.

## Alternatives Considered
- Separate React SPA + Express REST API server: Rejected due to duplicate deployments, cross-origin maintenance overhead, and redundant networking layer.
- NestJS Microservices: Rejected due to premature complexity and operational costs.

## Consequences
- Single unified deployment & codebase.
- Native React Server Components for server-side rendering and data fetching.
- Route Handlers serve as thin entry points for API contracts.
