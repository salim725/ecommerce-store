import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "@/src/shared/slices/uiSlice";
import authReducer from "@/src/features/auth/slices/authSlice";
import productsReducer from "@/src/features/products/slices/productsSlice";
import cartReducer from "@/src/features/cart/slices/cartSlice";
import profileReducer from "@/src/features/profile/slices/profileSlice";





export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    products: productsReducer,
    cart: cartReducer,
    profile:profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;