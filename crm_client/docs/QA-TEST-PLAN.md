# CRM Frontend — QA Test Plan

**Stack:** Next.js 16 (App Router) · React 19 · Redux Toolkit · Axios · Tailwind / shadcn  
**Current coverage:** Unit tests started (`formatPrice`, `formatDate`, `authSlice`). No E2E yet.

---

## Feature: Authentication (OTP + Admin-only)

### Risk Assessment: **High**

| ID | Title | Given | When | Then | Edge cases |
|----|-------|-------|------|------|------------|
| TC-AUTH-001 | Admin login sends OTP step | Valid admin credentials | Submit login form | `pendingEmail` set; redirect to `/verify-otp` | Wrong password; locked account; network timeout |
| TC-AUTH-002 | OTP verification succeeds | Valid OTP for pending email | Submit OTP form | Token in `localStorage`; user in Redux; dashboard accessible | Expired OTP; wrong code; rate limit |
| TC-AUTH-003 | Non-admin blocked at OTP | Agent/viewer credentials pass login | Verify OTP | Error "Admin access required"; token removed | Role changes server-side after token issued |
| TC-AUTH-004 | Session restore | Valid `crm_token` | App loads / `fetchMe` | Admin user hydrated | Missing token; 401 from API; non-admin on refresh |
| TC-AUTH-005 | Logout | Authenticated admin | Click logout | Redux cleared; token removed; redirect login | Double-click logout |
| TC-AUTH-006 | 401 interceptor | Expired token on API call | Any authenticated request returns 401 | Token cleared; redirect `/login` | Concurrent requests during redirect |

---

## Feature: Orders

### Risk Assessment: **High**

| ID | Title | Given | When | Then | Edge cases |
|----|-------|-------|------|------|------------|
| TC-ORD-001 | List orders | Admin on orders page | Page loads | Paginated table; totals match API | Empty list; page > totalPages |
| TC-ORD-002 | Update status | Order in list | Change status via UI | Row reflects new status; API called | Invalid status; optimistic rollback on failure |
| TC-ORD-003 | Loading / error UI | Slow or failing API | Fetch orders | Skeleton/spinner; error message | Retry after error |

---

## Feature: Products

### Risk Assessment: **Medium**

| ID | Title | Given | When | Then | Edge cases |
|----|-------|-------|------|------|------------|
| TC-PRD-001 | List products | Products exist | Open `/products` | Table renders name, price, stock | Empty catalog |
| TC-PRD-002 | Create product | Valid form data | Submit create | Toast success; list refresh | Validation errors; duplicate SKU; image upload failure |
| TC-PRD-003 | Edit / delete | Existing product | Edit or delete with confirm | Changes persisted or row removed | Delete cancelled; 404 on stale id |

---

## Feature: Users

### Risk Assessment: **High** (RBAC / PII)

| ID | Title | Given | When | Then | Edge cases |
|----|-------|-------|------|------|------------|
| TC-USR-001 | List users | Admin session | Open `/users` | Users table with roles | Empty; unauthorized 403 |
| TC-USR-002 | Create user | Valid payload | Submit form | New user appears | Duplicate email; weak password rules |
| TC-USR-003 | Edit user | Existing user | Save changes | Updated fields in list | Self-edit; role downgrade |

---

## Feature: Dashboard

### Risk Assessment: **Medium**

| ID | Title | Given | When | Then | Edge cases |
|----|-------|-------|------|------|------------|
| TC-DSH-001 | Stats cards | API returns metrics | Load `/` | Revenue, orders, users shown | Zero values; API partial failure |
| TC-DSH-002 | Revenue chart | Historical data | Dashboard load | Chart renders without layout shift | Single data point; null series |
| TC-DSH-003 | Recent orders | Orders in response | Dashboard load | Recent list matches API order | Empty recent orders |

---

## Feature: Notifications

### Risk Assessment: **Low**

| ID | Title | Given | When | Then | Edge cases |
|----|-------|-------|------|------|------------|
| TC-NTF-001 | Bell badge | Unread notifications | Open app | Count on bell | Count > 99 |
| TC-NTF-002 | Mark read | Unread item | Open notifications page | Item marked read | Already read |

---

## Feature: Navigation & layout

### Risk Assessment: **Low**

| ID | Title | Given | When | Then | Edge cases |
|----|-------|-------|------|------|------------|
| TC-NAV-001 | Sidebar collapse | Desktop viewport | Toggle sidebar | State persisted (hook) | Mobile sheet vs desktop |
| TC-NAV-002 | Protected routes | No token | Visit `/orders` | Redirect to login (when proxy wired) | Deep link after login |

---

## Coverage priorities

| Priority | Area | Tool |
|----------|------|------|
| P0 | `authSlice`, `LoginForm`, `OtpForm`, axios 401 | Jest + RTL |
| P0 | Login → OTP → dashboard | Playwright |
| P1 | Orders status update, products CRUD | Jest + Playwright |
| P1 | Users CRUD + admin gate | Jest + Playwright |
| P2 | Dashboard charts, notifications | RTL + snapshot sparingly |

---

## Testability notes (code review)

1. **`localStorage` in thunks** — `verify2FA` / `fetchMe` touch `localStorage` directly; tests need the mock in `jest.setup.ts` (done). Consider a thin `tokenStorage` adapter for easier injection.
2. **`axiosInstance` side effects** — 401 handler uses `window.location.href`; unit-test with `jest.spyOn` or extract redirect to a testable function.
3. **`proxy.ts` is a no-op** — E2E cannot rely on middleware auth until redirects are implemented; add Playwright `storageState` with preset token.
4. **Duplicate `getErrorMessage`** — Identical helpers in multiple slices; extract to `shared/utils/errors.ts` and unit-test once.
5. **`LoginForm` uses `React.SubmitEvent`** — Prefer `FormEvent` for broader compatibility; test with RTL `userEvent.click(submit)`.

---

## Suggested next files

```
crm/src/features/auth/components/LoginForm.test.tsx
crm/src/features/orders/slices/ordersSlice.test.ts
crm/e2e/auth.spec.ts          # Playwright
crm/playwright.config.ts
```
