# Axios Instance & Redux Setup — ecommerce-store

---

## Axios Instance (same pattern for both Next.js apps)

```ts
// crm_client/lib/axios.ts  (or store_front/lib/axios.ts)
import axios from 'axios';
import { store } from '@/store';
import { logout, setToken } from '@/store/slices/authSlice';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/api/v1',
  withCredentials: true, // sends httpOnly refresh cookie
  timeout: 15000,
});

// Request interceptor: attach access token
axiosInstance.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 → refresh → retry
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axiosInstance.post('/auth/refresh'); // cookie sent automatically
        const newToken = data.data.token;
        store.dispatch(setToken(newToken));
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        store.dispatch(logout());
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
```

---

## Redux Store Setup

```ts
// crm_client/store/index.ts  (or store_front/store/index.ts)
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import categoryReducer from './slices/categorySlice';
import orderReducer from './slices/orderSlice';
// store_front only:
// import cartReducer from './slices/cartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    categories: categoryReducer,
    orders: orderReducer,
    // cart: cartReducer,  // store_front only
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks — always use these instead of raw useDispatch/useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

## RTK Slice Pattern (Standard Template)

Use this template for every entity slice. Replace `Product`/`product` with the entity name.

```ts
// crm_client/store/slices/productSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/lib/axios';
import { Product, ProductState, ProductFilters, PaginationMeta } from '@/types';
import { RootState } from '@/store';

const defaultFilters: ProductFilters = {
  page: 1,
  limit: 20,
  sort: 'createdAt',
  order: 'desc',
};

const initialState: ProductState = {
  items: [],
  selected: null,
  isLoading: false,
  error: null,
  pagination: null,
  filters: defaultFilters,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchProducts = createAsyncThunk<
  { items: Product[]; pagination: PaginationMeta },
  Partial<ProductFilters>,
  { rejectValue: string; state: RootState }
>('products/fetchAll', async (overrides, { getState, rejectWithValue }) => {
  try {
    const filters = { ...getState().products.filters, ...overrides };
    const params = new URLSearchParams(filters as unknown as Record<string, string>).toString();
    const { data } = await axiosInstance.get(`/products?${params}`);
    return { items: data.data, pagination: data.pagination };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch products');
  }
});

export const fetchProductById = createAsyncThunk<Product, string, { rejectValue: string }>(
  'products/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/products/${id}`);
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Product not found');
    }
  }
);

export const createProduct = createAsyncThunk<Product, Partial<Product>, { rejectValue: string }>(
  'products/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/products', payload);
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk<
  Product,
  { id: string; payload: Partial<Product> },
  { rejectValue: string }
>('products/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.put(`/products/${id}`, payload);
    return data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update product');
  }
});

export const deleteProduct = createAsyncThunk<string, string, { rejectValue: string }>(
  'products/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/products/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete product');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ProductFilters>>) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    clearSelected: (state) => {
      state.selected = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchProducts
    builder
      .addCase(fetchProducts.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Unknown error';
      });

    // fetchProductById
    builder
      .addCase(fetchProductById.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selected = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Unknown error';
      });

    // createProduct
    builder.addCase(createProduct.fulfilled, (state, action) => {
      state.items.unshift(action.payload);
      if (state.pagination) state.pagination.total += 1;
    });

    // updateProduct
    builder.addCase(updateProduct.fulfilled, (state, action) => {
      const idx = state.items.findIndex(p => p._id === action.payload._id);
      if (idx !== -1) state.items[idx] = action.payload;
      if (state.selected?._id === action.payload._id) state.selected = action.payload;
    });

    // deleteProduct
    builder.addCase(deleteProduct.fulfilled, (state, action) => {
      state.items = state.items.filter(p => p._id !== action.payload);
      if (state.pagination) state.pagination.total -= 1;
    });
  },
});

export const { setFilters, clearSelected, clearError } = productSlice.actions;
export default productSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectProducts = (state: RootState) => state.products.items;
export const selectSelectedProduct = (state: RootState) => state.products.selected;
export const selectProductsLoading = (state: RootState) => state.products.isLoading;
export const selectProductsError = (state: RootState) => state.products.error;
export const selectProductsPagination = (state: RootState) => state.products.pagination;
export const selectProductFilters = (state: RootState) => state.products.filters;
```