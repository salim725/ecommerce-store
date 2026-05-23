import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "@/src/shared/slices/uiSlice";
import authReducer from "@/src/features/auth/slices/authSlice";
import usersReducer from "@/src/features/users/slices/usersSlice";
import productsReducer from "@/src/features/products/slices/productsSlice"
import ordersReducer   from "@/src/features/orders/slices/ordersSlice";
import dashboardReducer from "@/src/features/dashboard/slices/dashboardSlice";
import notificationsReducer from "@/src/shared/slices/notificationsSlice";


export const store = configureStore({
  reducer: {
    auth:     authReducer,
    users:    usersReducer,
    products: productsReducer,
    orders:   ordersReducer,
    dashboard: dashboardReducer,
    ui:       uiReducer,
    notifications: notificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;