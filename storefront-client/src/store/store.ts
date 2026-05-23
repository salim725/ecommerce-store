import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "@/src/shared/slices/uiSlice";

// Placeholder reducers for features not yet built
import { createSlice } from "@reduxjs/toolkit";

const authPlaceholder = createSlice({
  name: "auth",
  initialState: { user: null, token: null, isLoading: false, error: null, isAuthenticated: false },
  reducers: {},
});

const productsPlaceholder = createSlice({
  name: "products",
  initialState: { items: [], featured: [], isLoading: false, error: null },
  reducers: {},
});

const cartPlaceholder = createSlice({
  name: "cart",
  initialState: { items: [], isLoading: false, error: null },
  reducers: {},
});

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authPlaceholder.reducer,
    products: productsPlaceholder.reducer,
    cart: cartPlaceholder.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;