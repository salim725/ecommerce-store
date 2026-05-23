# CRM Admin Dashboard (Frontend)

A full-featured **admin CRM** built with **Next.js 16**, **React 19**, **TypeScript**, **Redux Toolkit**, and **shadcn/ui**. It connects to a real **Node.js / Express / MongoDB** API (`crm_backend`) for authentication, users, products, orders, and dashboard analytics.

Use this README for your **portfolio**, **teacher review**, or **GitHub** — it explains what the app does, how it is built, and how to run or deploy it.

---

## Live demo & repo

| Item | Notes |
|------|--------|
| **Frontend** | This folder (`crm`) — Next.js admin SPA |
| **Backend** | `../crm_backend/server/src` — API on port **3010** (`/api/v1`) |
| **GitHub** | Push the monorepo or `crm` folder; share the repo URL + branch |
| **Static deploy** | GitHub Pages / Netlify — see [Deploy] |

The UI works only when the API is running and `NEXT_PUBLIC_API_URL` + **CORS** are configured correctly.

---

## What this project demonstrates (portfolio highlights)

- **Full-stack integration** — Frontend wired to a real REST API (not only a mock server): auth, users, products with image upload, orders, admin stats.
- **Secure admin auth** — Two-step login (password → email OTP), JWT in `localStorage`, route guard, **admin-only** access.
- **Modern React architecture** — Feature folders, Redux async thunks for all server state, shared Axios instance with interceptors.
- **Production-minded UI** — Dark shell + light content panels, responsive sidebar, data tables, charts (Recharts), accessible shadcn/ui components.
- **Testing** — Jest + React Testing Library + `axios-mock-adapter` for auth flow, interceptors, and CRUD integration tests.

---

## Features

| Page | Route | What you can do |
|------|--------|------------------|
| **Dashboard** | `/` | KPI cards, revenue chart, recent orders |
| **Users** | `/users` | List users, change roles, delete users |
| **Products** | `/products` | CRUD with **multipart** image upload (Cloudinary via API) |
| **Orders** | `/orders` | List orders, update status (pending → shipped → …) |
| **Notifications** | `/notifications` | In-app notification list |
| **Login** | `/login` | Admin email + password |
| **Verify OTP** | `/verify-otp` | 2FA code from email |

---

## Tech stack

| Layer | Technology |
|--------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui, Lucide icons |
| State | Redux Toolkit, React-Redux |
| HTTP | Axios (shared instance + interceptors) |
| Charts | Recharts |
| Tests | Jest 30, React Testing Library, axios-mock-adapter |

---

## Project structure

```
crm/
├── src/
│   ├── app/
│   │   ├── (auth)/          # login, verify-otp
│   │   └── (dashboard)/     # protected admin pages
│   ├── features/
│   │   ├── auth/            # login, OTP, authSlice
│   │   ├── dashboard/       # stats, charts, recent orders
│   │   ├── users/
│   │   ├── products/
│   │   └── orders/
│   ├── shared/
│   │   ├── components/      # Sidebar, Navbar, DataTable, …
│   │   ├── services/        # axiosInstance, apiResponse unwrap
│   │   └── utils/
│   ├── components/ui/       # shadcn primitives
│   └── store/               # Redux store
├── src/__tests__/           # integration tests
├── .env.example             # template (committed)
└── .env.local               # copy from example (not committed)
```

**Pattern:** each feature has `services/*Api.ts`, `slices/*Slice.ts`, and `components/*`.

---

## How development progressed (typical workflow)

This matches the work done while building the CRM in this repo:

1. **UI shell** — Dashboard layout, sidebar, navbar, dark/light `ContentPanel`, shared `DataTable`, pagination, modals.
2. **Design polish** — shadcn tokens, select dropdowns, notification bell, mobile sheet sidebar, contrast and layering fixes.
3. **API contract** — Align frontend with `crm_backend` at `http://localhost:3010/api/v1` (replacing mock-server port 5000).
4. **Auth integration** — Admin login + `verify-2fa`, `pendingEmail` in Redux, `GET /auth/me`, client guard in `(dashboard)/layout.tsx`.
5. **Module integration** — Users, dashboard stats, products (FormData + images), orders (status enum + mapper).
6. **Backend fixes** — CORS configuration, user seed script, env setup.
7. **Tests** — Auth flow, Axios interceptors, products CRUD integration tests.
8. **Deploy** — Push to GitHub for review; optional static export to **GitHub Pages** with Actions.

---

## Prerequisites

- **Node.js** 20+
- **pnpm** (or npm)
- **MongoDB** + running **crm_backend** (see backend README or `crm_backend/server/src`)
- **SMTP** on the backend for admin OTP emails (login step 2)

---

## Quick start (local)

### 1. Backend (separate terminal)

```bash
cd crm_backend/server/src
pnpm install
# Copy .env.example → .env and fill MONGO_URI, JWT_SECRET, CORS, EMAIL_*, etc.
pnpm dev
```

API base: `http://localhost:3010/api/v1`

Seed an admin user (if available):

```bash
pnpm seed:users
```

### 2. Frontend (this app)

```bash
cd crm
pnpm install
```

Copy the env template and edit if needed:

```bash
cp .env.example .env.local   # Windows: copy .env.example .env.local
```

Run:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3. Login flow

1. Go to `/login` — enter admin email + password.
2. Backend sends OTP email → go to `/verify-otp` and enter the code.
3. JWT is stored as `crm_token`; dashboard loads only for `role === "admin"`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server (port 3000) |
| `pnpm build` | Production build |
| `pnpm start` | Run production build |
| `pnpm lint` | ESLint |
| `pnpm test` | Jest unit + integration tests |
| `pnpm test:watch` | Jest in watch mode |
| `pnpm test:coverage` | Coverage report |

---

## Architecture notes (for reviewers)

### API responses

Most endpoints return:

```json
{ "status": 200, "message": "...", "data": { } }
```

Always use the shared unwrap helper (`src/shared/services/apiResponse.ts`) — use `res.data.data`, not raw `res.data`.

### Redux

- All server data goes through **async thunks** in feature slices.
- No raw `useEffect` + `fetch` for API calls in pages.

### Product images

Create/update uses **`multipart/form-data`** and `FormData.append("images", file)` — not JSON.

### Auth guard

`(dashboard)/layout.tsx` checks `localStorage` token → `fetchMe()` → rejects non-admin users.

### Axios

`src/shared/services/axiosInstance.ts` attaches `Authorization: Bearer <token>` and redirects to `/login` on **401**.

---

## Environment variables

| Variable | Where | Example |
|----------|--------|---------|
| `NEXT_PUBLIC_API_URL` | `crm/.env.local` | `http://localhost:3010/api/v1` |

**Never commit** `.env.local` or real secrets. For GitHub Actions, set `NEXT_PUBLIC_API_URL` as a repository **secret**.

Backend variables (`MONGO_URI`, `JWT_SECRET`, `CORS_CLIENTS`, `EMAIL_*`, `CLOUDINARY_*`) live in `crm_backend/server/src/.env`.

---

## Testing

```bash
cd crm
pnpm test
```

Includes:

- `authSlice` / admin auth flow
- Axios interceptor behavior (401 → login)
- Products API integration (mocked backend)

---

## Deploy (for portfolio / teacher)

### A. Code on GitHub (teacher reviews source)

From your git root (often `crm` or `crm_client`):

```bash
git add .
git commit -m "feat(crm): submit admin dashboard for review"
git push origin main
```

Share: repo URL, branch name, and the **Quick start** steps above. Reviewers copy `.env.example` → `.env.local`.

### B. Live UI on GitHub Pages (static frontend)

The app is mostly client-side, so it can be exported as static HTML/JS:

1. In `next.config.ts`: `output: "export"`, and if the repo is `username.github.io/REPO_NAME`, set `basePath` / `assetPrefix` to `/REPO_NAME`.
2. **Remove or rename** `src/proxy.ts` before static build (Next static export does not support it; auth is already in the dashboard layout).
3. Set `NEXT_PUBLIC_API_URL` at build time to your **hosted** API URL.
4. Add your Pages origin to backend **`CORS_CLIENTS`**.
5. Use a GitHub Actions workflow to `pnpm build` and publish the `out/` folder (Settings → Pages → Source: **GitHub Actions**).

**Important:** GitHub Pages only hosts the frontend. The API must run on Render, Railway, a VPS, etc.

### C. Easiest full Next.js deploy

**Vercel** (or Netlify) with `crm` as root — no `output: "export"` required; set `NEXT_PUBLIC_API_URL` in the host dashboard.

---

## Monorepo layout

```
crm_client/
├── crm/                 ← this project (frontend)
├── crm_backend/         ← Express API
└── mock-server/         ← optional legacy mock (port 5000)
```

The frontend was **integrated against `crm_backend`**, not the mock server, for production-like behavior.

---

## Troubleshooting

| Problem | What to check |
|---------|----------------|
| Login fails / CORS error | Backend `CORS_CLIENTS` includes `http://localhost:3000` (and your deploy URL) |
| `401` on every request | Token missing or expired; log in again |
| OTP never arrives | Backend SMTP `EMAIL_*` env vars |
| `pnpm` error in `crm_backend` | Run commands inside `crm_backend/server/src` (where `package.json` lives) |
| Build fails with **Proxy** | Remove `src/proxy.ts` for static export builds |
| Wrong API data shape | Unwrap `{ data }` envelope; see contract in `.cursor/skills/.../contract.md` |

---

## Screenshots for portfolio

Suggested captures:

1. Dashboard (KPI + chart + recent orders)
2. Products list + create/edit dialog with images
3. Orders list with status dropdown
4. Login + OTP screens

---

## License

Private / educational project — adjust as needed for your course or portfolio.
