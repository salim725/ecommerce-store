# E-Commerce Store — Monorepo

Full-stack e-commerce platform with a customer storefront, admin CRM dashboard, and shared REST API. Built with **Next.js 16**, **React 19**, **Express 5**, **MongoDB**, and **TypeScript**.

## Projects

| Project | Path | Port | Description |
|---------|------|------|-------------|
| **Storefront** | `storefront-client/` | 3000 | Customer-facing shop — browse products, cart, checkout, orders, profile |
| **CRM Admin** | `crm_client/` | 3001 | Admin dashboard — users, products, orders, analytics |
| **Backend API** | `backend/server/src/` | 3010 | Express REST API at `/api/v1` |
| **Shared types** | `packages/types/` | — | `@ecommerce/types` used by both frontends |

## Tech stack

| Layer | Technologies |
|-------|--------------|
| Storefront & CRM | Next.js 16, React 19, TypeScript, Redux Toolkit, Tailwind CSS 4, shadcn/ui |
| Backend | Express 5, Mongoose, JWT auth, Cloudinary, Nodemailer |
| Testing | Jest, React Testing Library |

## Prerequisites

- **Node.js** 20+
- **pnpm** or **npm**
- **MongoDB** (local or Atlas)
- **Cloudinary** account (product images)
- **SMTP** credentials (admin OTP / email verification)

## Quick start

Run each app in its own terminal.

### 1. Shared types (optional, rebuild after changes)

```bash
cd packages/types
npm install
npm run build
```

### 2. Backend API

```bash
cd backend/server/src
npm install
cp .env.example .env   # Windows: copy .env.example .env
# Fill MONGO_URI, JWT_*, EMAIL_*, CLOUDINARY_*, CORS_CLIENTS
npm run dev
```

API base URL: `http://localhost:3010/api/v1`

Seed admin and test users:

```bash
npm run seed:users
```

### 3. Storefront

```bash
cd storefront-client
pnpm install
```

Create `storefront-client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3010/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. CRM Admin

```bash
cd crm_client
pnpm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001).

See [crm_client/README.md](./crm_client/README.md) for the admin login flow (password + email OTP).

## Environment variables

### Backend (`backend/server/src/.env`)

| Variable | Purpose |
|----------|---------|
| `MONGO_URI` | MongoDB connection string |
| `PORT` | API port (default `3010`) |
| `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EMAIL_SECRET` | Token signing |
| `EMAIL_FROM`, `EMAIL_APP_PASSWORD` | SMTP for OTP / verification |
| `CLOUDINARY_*` | Image uploads |
| `CORS_CLIENTS` | JSON array of allowed frontend origins |

Copy from `.env.example` and adjust values.

### Frontends (`.env.local`)

| Variable | Storefront | CRM |
|----------|------------|-----|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3010/api/v1` | same |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `http://localhost:3001` |

**Important:** API URL must include `/api/v1` and have **no trailing slash**.

Backend `CORS_CLIENTS` must include both `http://localhost:3000` and `http://localhost:3001`.

## API routes

| Prefix | Features |
|--------|----------|
| `/api/v1/auth` | Register, login, refresh, email verification, admin 2FA |
| `/api/v1/products` | Product catalog, search, filters |
| `/api/v1/cart` | Cart CRUD |
| `/api/v1/orders` | Checkout and order history |
| `/api/v1/users` | User management (admin) |
| `/api/v1/admin` | Dashboard stats |
| `/api/v1/categories` | Product categories |

Responses use a shared envelope: `{ success, status, message, data }`.

## Scripts

### Backend (`backend/server/src`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run start` | Run production build |
| `npm run seed:users` | Seed admin and customer users |

### Storefront & CRM

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Run production build |
| `pnpm lint` | ESLint |
| `pnpm test` | Jest tests |

## Repository structure

```
store-front/
├── backend/
│   └── server/
│       └── src/              # Express API
├── storefront-client/        # Customer Next.js app
├── crm_client/               # Admin Next.js app
├── packages/
│   └── types/                # @ecommerce/types
└── README.md                 # This file
```

## Further reading

- [storefront-client/README.md](./storefront-client/README.md) — storefront API integration notes
- [crm_client/README.md](./crm_client/README.md) — admin features, auth flow, deployment

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS errors | Add your frontend URL to backend `CORS_CLIENTS` |
| `401` on requests | Log in again; check JWT / refresh cookie setup |
| OTP email not received | Verify backend `EMAIL_*` env vars |
| `@ecommerce/types` not found | Run `npm run build` in `packages/types`, then reinstall in the frontend |
| API connection refused | Start the backend before the frontends |

## License

Private / educational project.
