# E2E Tests Reference — Playwright

## Table of Contents
1. [Playwright Setup](#1-playwright-setup)
2. [Auth Helper (Reusable)](#2-auth-helper-reusable)
3. [Storefront Journey Tests](#3-storefront-journey-tests)
4. [CRM Admin Workflow Tests](#4-crm-admin-workflow-tests)
5. [Cross-Project API Contract Tests](#5-cross-project-api-contract-tests)

---

## 1. Playwright Setup

```ts
// playwright.config.ts  (root of monorepo)
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  projects: [
    {
      name: 'storefront',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.STOREFRONT_URL ?? 'http://localhost:3001',
      },
      testMatch: 'e2e/storefront/**/*.spec.ts',
    },
    {
      name: 'crm',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.CRM_URL ?? 'http://localhost:3002',
      },
      testMatch: 'e2e/crm/**/*.spec.ts',
    },
  ],

  // Spin up backend + both frontends before the test run
  webServer: [
    {
      command: 'cd backend && npm run dev',
      url: 'http://localhost:5000/health',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'cd store_front && npm run dev -- --port 3001',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'cd crm_client && npm run dev -- --port 3002',
      url: 'http://localhost:3002',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
```

---

## 2. Auth Helper (Reusable)

Saved auth state avoids re-logging-in for every test — a massive speed win in E2E suites.

```ts
// e2e/helpers/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

// Run once per project; saved state is reused by all tests in that project.
// This is the Playwright-recommended pattern for authenticated test suites.
setup('authenticate as admin', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/login`);
  await page.getByLabel('Email').fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel('Password').fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole('button', { name: /log in/i }).click();
  await expect(page).toHaveURL(/dashboard/);
  await page.context().storageState({ path: 'e2e/.auth/admin.json' });
});
```

```ts
// e2e/helpers/api.helper.ts — seed & teardown test data via the API
import { APIRequestContext } from '@playwright/test';

export const createTestProduct = async (request: APIRequestContext, token: string) => {
  const res = await request.post('/api/v1/products', {
    headers: { Authorization: `Bearer ${token}` },
    data: { name: 'E2E Test Product', price: 49.99, stock: 100, category: 'test' },
  });
  return (await res.json()).data;
};

export const deleteTestProduct = async (
  request: APIRequestContext,
  token: string,
  id: string
) => {
  await request.delete(`/api/v1/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
```

---

## 3. Storefront Journey Tests

### Browse → Add to Cart → Checkout

```ts
// e2e/storefront/checkout.spec.ts
import { test, expect } from '@playwright/test';

// This test covers the single most important user journey.
// If this breaks, the business loses revenue. Run it on every deploy.
test.describe('Customer checkout journey', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cart state before each run to avoid cross-test contamination
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('guest can browse and add product to cart', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByTestId('product-grid')).toBeVisible();

    // Click the first product card
    const firstProduct = page.getByTestId('product-card').first();
    const productName = await firstProduct.getByTestId('product-name').textContent();
    await firstProduct.click();

    // Product detail page
    await expect(page).toHaveURL(/\/products\//);
    await expect(page.getByRole('heading', { name: productName! })).toBeVisible();

    await page.getByRole('button', { name: /add to cart/i }).click();

    // Cart badge should update
    await expect(page.getByTestId('cart-count')).toHaveText('1');
  });

  test('authenticated user can complete checkout', async ({ page }) => {
    // Log in as customer
    await page.goto('/login');
    await page.getByLabel('Email').fill(process.env.CUSTOMER_EMAIL!);
    await page.getByLabel('Password').fill(process.env.CUSTOMER_PASSWORD!);
    await page.getByRole('button', { name: /log in/i }).click();
    await expect(page).toHaveURL('/');

    // Add a product
    await page.goto('/products');
    await page.getByTestId('product-card').first().click();
    await page.getByRole('button', { name: /add to cart/i }).click();

    // Go to cart
    await page.goto('/cart');
    await expect(page.getByTestId('cart-item')).toHaveCount(1);

    // Proceed to checkout
    await page.getByRole('button', { name: /checkout/i }).click();
    await expect(page).toHaveURL('/checkout');

    // Fill shipping form
    await page.getByLabel(/full name/i).fill('Alice Test');
    await page.getByLabel(/address/i).fill('123 E2E Street');
    await page.getByLabel(/city/i).fill('Testville');

    // Place order
    await page.getByRole('button', { name: /place order/i }).click();
    await expect(page).toHaveURL(/\/orders\/[a-z0-9]+\/confirmation/);
    await expect(page.getByText(/order confirmed/i)).toBeVisible();
  });

  test('cart persists on page refresh', async ({ page }) => {
    await page.goto('/products');
    await page.getByTestId('product-card').first().click();
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.reload();
    await expect(page.getByTestId('cart-count')).toHaveText('1');
  });
});
```

### Product Search & Filter

```ts
// e2e/storefront/search.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Product search and filtering', () => {
  test('search by keyword returns relevant results', async ({ page }) => {
    await page.goto('/products');
    await page.getByPlaceholder(/search/i).fill('laptop');
    await page.keyboard.press('Enter');
    const results = page.getByTestId('product-card');
    await expect(results.first()).toContainText(/laptop/i);
  });

  test('shows empty state for no results', async ({ page }) => {
    await page.goto('/products');
    await page.getByPlaceholder(/search/i).fill('xyzthisdoesnotexist123');
    await page.keyboard.press('Enter');
    await expect(page.getByText(/no products found/i)).toBeVisible();
  });

  test('price range filter reduces results', async ({ page }) => {
    await page.goto('/products');
    const totalBefore = await page.getByTestId('product-card').count();
    await page.getByLabel(/max price/i).fill('100');
    await page.getByRole('button', { name: /apply/i }).click();
    const totalAfter = await page.getByTestId('product-card').count();
    expect(totalAfter).toBeLessThanOrEqual(totalBefore);
  });
});
```

---

## 4. CRM Admin Workflow Tests

```ts
// e2e/crm/product-management.spec.ts
import { test, expect } from '@playwright/test';

// Use saved auth state — admin is already logged in
test.use({ storageState: 'e2e/.auth/admin.json' });

test.describe('CRM — Product Management', () => {
  const testProductName = `E2E Product ${Date.now()}`;

  test('admin can create, edit, and delete a product', async ({ page }) => {
    // CREATE
    await page.goto('/products/new');
    await page.getByLabel(/product name/i).fill(testProductName);
    await page.getByLabel(/price/i).fill('299.99');
    await page.getByLabel(/stock/i).fill('50');
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/product created/i)).toBeVisible(); // toast confirmation
    await expect(page).toHaveURL(/\/products\/[a-z0-9]+/);

    // EDIT
    await page.getByRole('button', { name: /edit/i }).click();
    await page.getByLabel(/price/i).clear();
    await page.getByLabel(/price/i).fill('249.99');
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/product updated/i)).toBeVisible();
    await expect(page.getByTestId('product-price')).toContainText('249.99');

    // DELETE
    await page.getByRole('button', { name: /delete/i }).click();
    await page.getByRole('button', { name: /confirm/i }).click(); // confirmation dialog
    await expect(page).toHaveURL('/products');
    await expect(page.getByText(testProductName)).not.toBeVisible();
  });

  test('admin can manage order status', async ({ page }) => {
    await page.goto('/orders');
    await expect(page.getByTestId('order-row')).not.toHaveCount(0);

    const firstOrder = page.getByTestId('order-row').first();
    await firstOrder.getByRole('button', { name: /view/i }).click();

    // Update status
    await page.getByLabel(/status/i).selectOption('shipped');
    await page.getByRole('button', { name: /update/i }).click();
    await expect(page.getByText(/order updated/i)).toBeVisible();
  });
});
```

### CRM Auth Guard Tests

```ts
// e2e/crm/auth-guard.spec.ts
import { test, expect } from '@playwright/test';

// These tests run WITHOUT saved auth state — testing unauthenticated access
test.describe('CRM auth guards', () => {
  test('redirects to /login when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('shows 403 when customer tries to access CRM', async ({ page }) => {
    // Log in as customer (wrong role)
    await page.goto('/login');
    await page.getByLabel('Email').fill(process.env.CUSTOMER_EMAIL!);
    await page.getByLabel('Password').fill(process.env.CUSTOMER_PASSWORD!);
    await page.getByRole('button', { name: /log in/i }).click();
    // CRM should reject customers — no dashboard access
    await expect(page.getByText(/not authorized/i)).toBeVisible();
  });
});
```

---

## 5. Cross-Project API Contract Tests

These tests validate that the frontend Axios calls match what the backend actually returns.
They catch contract drift before it reaches production.

```ts
// e2e/contracts/product-contract.spec.ts
import { test, expect } from '@playwright/test';

// We call the backend API directly (not via the frontend) and assert the shape.
// If this fails, every frontend that depends on this contract is broken.
test.describe('Product API contract', () => {
  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    const res = await request.post('http://localhost:5000/api/v1/auth/login', {
      data: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD },
    });
    adminToken = (await res.json()).data.token;
  });

  test('GET /api/v1/products returns correct pagination shape', async ({ request }) => {
    const res = await request.get('http://localhost:5000/api/v1/products?page=1&limit=10');
    const body = await res.json();

    // Assert the full contract shape that both CRM and storefront depend on
    expect(body).toMatchObject({
      success: true,
      data: expect.any(Array),
      pagination: {
        total: expect.any(Number),
        page: 1,
        limit: 10,
        pages: expect.any(Number),
      },
    });
  });

  test('POST /api/v1/products returns created product with correct shape', async ({ request }) => {
    const res = await request.post('http://localhost:5000/api/v1/products', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { name: 'Contract Test Product', price: 99, stock: 10 },
    });
    const body = await res.json();

    expect(res.status()).toBe(201);
    expect(body.data).toMatchObject({
      _id: expect.any(String),
      name: 'Contract Test Product',
      price: 99,
      stock: 10,
      createdAt: expect.any(String),
    });
    // Clean up
    await request.delete(`http://localhost:5000/api/v1/products/${body.data._id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  });

  test('error responses always follow the standard shape', async ({ request }) => {
    const res = await request.get('http://localhost:5000/api/v1/products/nonexistent-id');
    const body = await res.json();
    expect(res.status()).toBe(404);
    expect(body).toMatchObject({
      success: false,
      message: expect.any(String),
    });
    // No stray fields — both frontends parse this shape
    expect(body.data).toBeUndefined();
  });
});
```