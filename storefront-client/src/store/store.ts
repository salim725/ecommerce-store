import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/src/features/auth/slices/authSlice";
import cartReducer from "@/src/features/cart/slices/cartSlice";
import profileReducer from "@/src/features/profile/slices/profileSlice";
import uiReducer from "@/src/store/slices/uiSlice";
import { storefrontApi } from "@/src/shared/services/storefrontApi";
import { cartListenerMiddleware } from "@/src/store/cartListenerMiddleware";
import "@/src/features/auth/api/authApi";
import "@/src/features/cart/api/cartApi";

export const store = configureStore({
  reducer: {
    [storefrontApi.reducerPath]: storefrontApi.reducer,
    auth: authReducer,
    cart: cartReducer,
    profile: profileReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(storefrontApi.middleware)
      .prepend(cartListenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
