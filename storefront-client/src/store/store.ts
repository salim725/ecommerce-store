import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "@/src/shared/slices/uiSlice";
import authReducer from "@/src/features/auth/slices/authSlice";
import productsReducer from "@/src/features/products/slices/productsSlice";
import cartReducer from "@/src/features/cart/slices/cartSlice";





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