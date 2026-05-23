import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/src/features/auth/slices/authSlice";
import usersReducer from "@/src/features/users/slices/usersSlice";
import productsReducer from "@/src/features/products/slices/productsSlice";
import ordersReducer from "@/src/features/orders/slices/ordersSlice";
import dashboardReducer from "@/src/features/dashboard/slices/dashboardSlice";

export function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      users: usersReducer,
      products: productsReducer,
      orders: ordersReducer,
      dashboard: dashboardReducer,
    },
  });
}

export type TestStore = ReturnType<typeof makeStore>;
