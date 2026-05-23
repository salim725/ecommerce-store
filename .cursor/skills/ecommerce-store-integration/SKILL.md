---
name: ecommerce-store-integration
description: >
  Activate this skill whenever the user is building, debugging, reviewing, or architecting any
  feature in the `ecommerce-store` monorepo — especially cross-project work spanning the Express
  backend (`backend/`), the Next.js CRM admin dashboard (`crm_client/`), or the Next.js customer
  storefront (`store_front/`). Also trigger for phrases like "wire this feature end-to-end",
  "integrate the API", "build the [feature] module", "connect backend to frontend", "fix the auth
  flow", "add [Product/Order/User/Category] feature", or any task involving MongoDB schemas + Redux
  slices + API routes together. Trigger for any mention of ecommerce-store, cross-project API
  contracts, shared types/interfaces, monorepo tasks, or any feature spanning 2+ of the 3 projects.
  Do NOT wait for the user to say "use the skill" — activate proactively whenever the task touches
  any part of this stack: Express/Mongoose backend, Next.js CRM, or Next.js storefront.
---

# ecommerce-store Integration Skill

You are acting as a **Senior Fullstack Developer & Engineer** with deep expertise across all three
projects of the `ecommerce-store` monorepo simultaneously. You hold the entire backend ↔ CRM ↔
storefront contract in your head and never guess at API shapes, auth flows, or shared types.

## Monorepo Architecture at a Glance

```
ecommerce-store/
├── backend/          # Express v5 + TypeScript REST API (source of truth for all data)
├── crm_client/       # Next.js 16 Admin Dashboard (role-based, admin only)
└── store_front/      # Next.js 16 Customer Storefront (public-facing + auth)
```

**Single MongoDB database** — accessed only through `backend/`. Neither frontend touches the DB directly.

## Stack Quick Reference

| Layer | Project | Key Libs |
|---|---|---|
| API Server | `backend/` | Express v5, Mongoose v9, JWT, bcrypt, Multer, Cloudinary, Joi, Helmet, HPP, CORS, Morgan, Nodemailer |
| Admin CRM | `crm_client/` | Next.js 16, React 19, Redux Toolkit, Axios, shadcn/ui, Radix UI, Tailwind v4, Recharts, React-Toastify, Jest + RTL |
| Storefront | `store_front/` | Next.js 16, React 19, Redux Toolkit, Axios, shadcn/ui, Radix UI, Tailwind v4, Swiper, React Hook Form, React-Toastify |

---

## How to Approach Any Integration Task

### 1. Always show file ownership first
Every code snippet must be prefixed with the full path from the monorepo root:
```
// backend/src/routes/product.route.ts
// crm_client/store/slices/productSlice.ts
// store_front/app/products/page.tsx
```

### 2. Show the contract before the code
For any feature touching 2+ projects, write out the **full request/response contract** first:
- HTTP method + path
- Request body / query params (with TypeScript types)
- Response body (with TypeScript types)
- Error cases and status codes
Then implement in all affected projects.

### 3. Flag breaking changes
If a change breaks the contract for one or both frontends, call it out explicitly with a `⚠️ BREAKING CHANGE` note before the diff.

### 4. Include env vars
When adding new environment variables, show all three `.env` files that need updating.

---

## Reference Files — Read When Relevant

Load only what you need for the task at hand:

| Topic | File | When to read |
|---|---|---|
| API contracts & routes | `references/api-contracts.md` | Any backend route work or frontend API call |
| Auth flow (JWT end-to-end) | `references/auth-flow.md` | Login, registration, token refresh, guards |
| Shared TypeScript types | `references/shared-types.md` | Mongoose schemas, DTOs, Redux state shapes |
| Axios & Redux setup | `references/axios-redux.md` | HTTP layer, interceptors, RTK slice patterns |
| File upload pipeline | `references/file-uploads.md` | Multer → Cloudinary → frontend consumption |
| Environment variables | `references/env-contracts.md` | `.env` keys for all 3 projects |
| Storefront-specific | `references/storefront-patterns.md` | SSR/SSG strategy, RHF forms, Swiper, optimistic UI |
| CRM-specific | `references/crm-patterns.md` | Admin routes, role-based UI, Recharts mapping |

---

## Core Integration Domains (Summary — details in reference files)

### Auth Flow
- **backend**: issues JWT access token (short-lived) + refresh token (httpOnly cookie)
- **crm_client** + **store_front**: store access token in Redux, refresh via interceptor on 401
- Protected routes: Next.js middleware checks token; backend middleware validates `Authorization: Bearer <token>`
→ See `references/auth-flow.md`

### Axios Instances
Both Next.js apps have a configured Axios instance with:
- `baseURL` from env (`NEXT_PUBLIC_API_URL`)
- Request interceptor: attach `Authorization: Bearer <token>` from Redux store
- Response interceptor: on 401, call refresh endpoint, retry original request, on failure clear auth and redirect
→ See `references/axios-redux.md`

### Redux Store Architecture
- Slice naming: `<entity>Slice` (e.g., `productSlice`, `orderSlice`)
- Async thunks via `createAsyncThunk` — always typed with `<ReturnType, ArgType, { rejectValue: ApiError }>`
- `extraReducers` pattern: `pending` → loading, `fulfilled` → data, `rejected` → error
- Both apps share the same slice shape pattern; types come from `references/shared-types.md`
→ See `references/axios-redux.md`

### Error Response Format (backend → frontends)
```ts
// All backend errors follow this shape:
{ success: false, message: string, errors?: Record<string, string> }
// All backend success responses:
{ success: true, data: T, message?: string, pagination?: PaginationMeta }
```

### Pagination / Filtering / Sorting
```
GET /api/v1/<resource>?page=1&limit=20&sort=createdAt&order=desc&<filters>
```
Response always includes `pagination: { total, page, limit, pages }`.
→ See `references/api-contracts.md` for per-resource filter params.

---

## Code Quality Standards to Enforce

### backend/
- Strict TypeScript — no `any`, use `unknown` + type guards when needed
- Every route's request body validated with a **Joi schema** before hitting the controller
- Consistent error middleware — never `res.status(500).json(...)` inline; always `next(error)`
- Mongoose: prefer `.lean()` on read queries; add `.select()` to exclude `__v` and sensitive fields
- Index hints: add compound indexes in schema for common filter + sort combinations

### crm_client/
- RTK slice structure: `state`, `reducers`, `extraReducers`, selectors all in one file
- All admin pages behind Next.js middleware role check (`role === 'admin'`)
- Recharts data must be mapped from API response shape before passing to chart components
- Never call the API directly from a component — always through an RTK async thunk

### store_front/
- Choose SSR vs SSG per page: product listing → ISR; product detail → SSR; cart/checkout → CSR
- All forms use **React Hook Form**; validation schema with Zod or Joi
- Swiper for product carousels — use `SwiperSlide` per product card, lazy load images
- Optimistic UI for cart add/remove — update Redux state immediately, rollback on API error
- Never call the API directly from a component — always through an RTK async thunk

---

## Quick-Start Patterns

### Adding a New Feature (e.g., "Reviews" module)
1. Define the Mongoose schema → `backend/src/models/review.model.ts`
2. Write Joi validation schemas → `backend/src/validators/review.validator.ts`
3. Write route + controller → `backend/src/routes/review.route.ts` + `backend/src/controllers/review.controller.ts`
4. Register route in `backend/src/app.ts`
5. Add shared types → document in `references/shared-types.md` pattern
6. Add RTK slice in `crm_client/store/slices/reviewSlice.ts` (if CRM needs it)
7. Add RTK slice in `store_front/store/slices/reviewSlice.ts`
8. Add API thunks in both using the Axios instance
9. Wire UI in both apps

### Debugging a Cross-Project Issue
1. Check the backend error response shape matches the standard format
2. Check the Axios interceptor is forwarding the auth header
3. Check the Redux selector is reading the right state key
4. Check CORS config in `backend/src/app.ts` allows the frontend origin