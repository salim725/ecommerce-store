import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "@/src/shared/slices/uiSlice";

// Placeholder reducers for features not yet built
import { createSlice } from "@reduxjs/toolkit";
import authReducer from "@/src/feature/auth/slices/authSlice"
import productsReducer from "@/src/feature/products/slices/productsSlice";
import cartReducer from "@/src/feature/cart/slices/cartSlice";





export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    products: productsReducer,
    cart: cartReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;