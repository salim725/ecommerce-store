# Frontend Tests Reference

## Table of Contents
1. [Redux Slice Unit Tests](#1-redux-slice-unit-tests)
2. [Async Thunk Unit Tests](#2-async-thunk-unit-tests)
3. [React Component Tests (RTL)](#3-react-component-tests-rtl)
4. [Axios Mock Patterns](#4-axios-mock-patterns)
5. [TypeScript Utility Tests](#5-typescript-utility-tests)

---

## 1. Redux Slice Unit Tests

Test the reducer logic in complete isolation — no API calls, no components.
The slice is a pure function: given state + action → new state.

```ts
// crm_client/__tests__/unit/slices/productSlice.test.ts
import productReducer, {
  setProducts,
  clearProducts,
  setError,
} from '../../../store/slices/productSlice';
import type { ProductState } from '../../../store/slices/productSlice';

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
  pagination: null,
};

describe('productSlice reducer', () => {
  describe('setProducts', () => {
    it('replaces products array and clears error', () => {
      const stateWithError: ProductState = { ...initialState, error: 'old error' };
      const payload = { products: [{ _id: 'p1', name: 'Laptop', price: 999 }], pagination: null };
      const next = productReducer(stateWithError, setProducts(payload));
      expect(next.products).toEqual(payload.products);
      expect(next.error).toBeNull(); // error must be cleared on successful data receipt
    });
  });

  describe('clearProducts', () => {
    it('resets slice to initial state', () => {
      const dirtyState: ProductState = {
        ...initialState,
        products: [{ _id: 'p1' } as any],
        error: 'oops',
      };
      const next = productReducer(dirtyState, clearProducts());
      expect(next).toEqual(initialState);
    });
  });

  describe('setError', () => {
    it('sets error and stops loading', () => {
      const loadingState: ProductState = { ...initialState, loading: true };
      const next = productReducer(loadingState, setError('Network timeout'));
      expect(next.error).toBe('Network timeout');
      expect(next.loading).toBe(false); // never leave loading: true on error
    });
  });
});
```

---

## 2. Async Thunk Unit Tests

Thunks are tested by dispatching them against a real Redux store (with mock Axios).
We verify state transitions: pending → fulfilled/rejected.

```ts
// crm_client/__tests__/unit/slices/productThunks.test.ts
import { configureStore } from '@reduxjs/toolkit';
import productReducer, { fetchProducts } from '../../../store/slices/productSlice';
import axiosInstance from '../../../lib/axios'; // the configured Axios instance

// Mock the Axios instance — we test Redux logic, not HTTP.
// Each test controls exactly what the API "returns".
jest.mock('../../../lib/axios');
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

const buildStore = () =>
  configureStore({ reducer: { products: productReducer } });

describe('fetchProducts thunk', () => {
  let store: ReturnType<typeof buildStore>;

  beforeEach(() => {
    store = buildStore();
    jest.clearAllMocks();
  });

  it('sets loading: true while pending', () => {
    // Never resolves — captures the in-flight state
    mockedAxios.get.mockReturnValue(new Promise(() => {}));
    store.dispatch(fetchProducts({ page: 1, limit: 20 }));
    expect(store.getState().products.loading).toBe(true);
  });

  it('populates products on fulfilled', async () => {
    const fakeData = {
      data: {
        success: true,
        data: [{ _id: 'p1', name: 'Laptop', price: 999 }],
        pagination: { total: 1, page: 1, limit: 20, pages: 1 },
      },
    };
    mockedAxios.get.mockResolvedValue(fakeData);

    await store.dispatch(fetchProducts({ page: 1, limit: 20 }));

    const state = store.getState().products;
    expect(state.loading).toBe(false);
    expect(state.products).toHaveLength(1);
    expect(state.error).toBeNull();
  });

  it('sets error on rejected and stops loading', async () => {
    mockedAxios.get.mockRejectedValue({
      response: { data: { success: false, message: 'Unauthorized' } },
    });

    await store.dispatch(fetchProducts({ page: 1, limit: 20 }));

    const state = store.getState().products;
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Unauthorized');
    expect(state.products).toHaveLength(0); // failed fetch must not corrupt existing data
  });
});
```

---

## 3. React Component Tests (RTL)

RTL tests verify **user-visible behaviour**, not implementation details.
Never test internal state — test what the user sees and can do.

### Product List Component

```tsx
// crm_client/__tests__/unit/components/ProductList.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProductList from '../../../components/ProductList';
import productReducer from '../../../store/slices/productSlice';

// Build a test store pre-populated with state — avoids async thunk complications
const buildStore = (preloadedState?: object) =>
  configureStore({ reducer: { products: productReducer }, preloadedState });

const renderWithStore = (state?: object) => {
  const store = buildStore(state);
  return { ...render(<Provider store={store}><ProductList /></Provider>), store };
};

describe('ProductList', () => {
  it('shows loading spinner when loading: true', () => {
    renderWithStore({ products: { products: [], loading: true, error: null, pagination: null } });
    expect(screen.getByRole('status')).toBeInTheDocument(); // spinner has role="status"
  });

  it('shows error message when error is set', () => {
    renderWithStore({
      products: { products: [], loading: false, error: 'Failed to load', pagination: null },
    });
    expect(screen.getByText(/Failed to load/i)).toBeInTheDocument();
  });

  it('renders product rows when data is present', () => {
    renderWithStore({
      products: {
        loading: false,
        error: null,
        pagination: null,
        products: [
          { _id: 'p1', name: 'Laptop', price: 999, stock: 10 },
          { _id: 'p2', name: 'Phone', price: 499, stock: 5 },
        ],
      },
    });
    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
  });

  it('shows empty state when products array is empty', () => {
    renderWithStore({
      products: { products: [], loading: false, error: null, pagination: null },
    });
    expect(screen.getByText(/no products/i)).toBeInTheDocument();
  });
});
```

### Login Form Component

```tsx
// store_front/__tests__/unit/components/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import LoginForm from '../../../components/LoginForm';
import { buildStore } from '../../helpers/store.helper';

describe('LoginForm', () => {
  it('disables submit while email or password is empty', () => {
    render(<Provider store={buildStore()}><LoginForm /></Provider>);
    const button = screen.getByRole('button', { name: /log in/i });
    expect(button).toBeDisabled();
  });

  it('shows inline validation error for invalid email format', async () => {
    render(<Provider store={buildStore()}><LoginForm /></Provider>);
    await userEvent.type(screen.getByLabelText(/email/i), 'not-an-email');
    fireEvent.blur(screen.getByLabelText(/email/i));
    await waitFor(() =>
      expect(screen.getByText(/valid email/i)).toBeInTheDocument()
    );
  });

  it('calls dispatch with login thunk on valid submit', async () => {
    const store = buildStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    render(<Provider store={store}><LoginForm /></Provider>);
    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    await waitFor(() => expect(dispatchSpy).toHaveBeenCalled());
  });
});
```

---

## 4. Axios Mock Patterns

### Pattern A: jest.mock() at module level (for thunk tests)

```ts
jest.mock('../../../lib/axios');
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;
mockedAxios.get.mockResolvedValue({ data: { success: true, data: [] } });
```

### Pattern B: MSW (Mock Service Worker) for component + integration tests

When testing components that fire thunks with real API calls, use MSW to intercept
at the network level — this is more realistic than mocking Axios directly.

```ts
// __tests__/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products`, (req, res, ctx) =>
    res(ctx.json({
      success: true,
      data: [{ _id: 'p1', name: 'Laptop', price: 999 }],
      pagination: { total: 1, page: 1, limit: 20, pages: 1 },
    }))
  ),
  rest.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, (req, res, ctx) =>
    res(ctx.json({ success: true, data: { token: 'fake-jwt-token' } }))
  ),
];
```

```ts
// __tests__/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';
export const server = setupServer(...handlers);
```

```ts
// jest.setup.ts
import { server } from './__tests__/mocks/server';
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Pattern C: Override handlers per test (for error scenarios)

```ts
import { rest } from 'msw';
import { server } from '../../mocks/server';

it('shows error toast on 500 response', async () => {
  server.use(
    rest.get('*/api/v1/products', (req, res, ctx) =>
      res(ctx.status(500), ctx.json({ success: false, message: 'Server error' }))
    )
  );
  // ... render and assert error state
});
```

---

## 5. TypeScript Utility Tests

```ts
// backend/src/__tests__/unit/utils/pagination.util.test.ts
import { buildPaginationMeta } from '../../../utils/pagination.util';

// Utility functions are the easiest to test thoroughly — no mocks needed.
// Cover every branch so miscalculations don't silently corrupt API responses.
describe('buildPaginationMeta', () => {
  it('calculates pages correctly', () => {
    const meta = buildPaginationMeta({ total: 55, page: 1, limit: 20 });
    expect(meta.pages).toBe(3); // ceil(55/20)
    expect(meta.total).toBe(55);
  });

  it('returns pages: 0 when total is 0', () => {
    const meta = buildPaginationMeta({ total: 0, page: 1, limit: 20 });
    expect(meta.pages).toBe(0);
  });

  it('handles limit larger than total gracefully', () => {
    const meta = buildPaginationMeta({ total: 5, page: 1, limit: 20 });
    expect(meta.pages).toBe(1);
  });
});
```