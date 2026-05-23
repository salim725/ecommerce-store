import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "@/src/shared/slices/uiSlice";

// Placeholder reducers for features not yet built
import { createSlice } from "@reduxjs/toolkit";
import authReducer from "@/src/feature/auth/slices/authSlice"


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
    auth: authReducer,
    products: productsPlaceholder.reducer,
    cart: cartPlaceholder.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;