import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { updateUser, removeUser } from "@/src/features/users/slices/usersSlice";
import {
  createProduct,
  updateProduct,
  removeProduct,
} from "@/src/features/products/slices/productsSlice";
import { updateOrderStatus } from "@/src/features/orders/slices/ordersSlice";

export type NotificationType = "success" | "error" | "info";

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

interface NotificationsState {
  items: Notification[];
}

const initialState: NotificationsState = {
  items: [],
};

const make = (message: string, type: NotificationType): Notification => ({
  id: crypto.randomUUID(),
  message,
  type,
  read: false,
  createdAt: new Date().toISOString(),
});

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification(
      state,
      action: PayloadAction<{ message: string; type: NotificationType }>,
    ) {
      state.items.unshift(make(action.payload.message, action.payload.type));
    },
    markAsRead(state, action: PayloadAction<string>) {
      const n = state.items.find((n) => n.id === action.payload);
      if (n) n.read = true;
    },
    markAllAsRead(state) {
      state.items.forEach((n) => (n.read = true));
    },
    clearAll(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    // ── Users ──
    builder.addCase(updateUser.fulfilled, (state) => {
      state.items.unshift(make("User role updated successfully.", "info"));
    });
    builder.addCase(removeUser.fulfilled, (state) => {
      state.items.unshift(make("User deleted.", "error"));
    });

    // ── Products ──
    builder.addCase(createProduct.fulfilled, (state) => {
      state.items.unshift(make("New product added successfully.", "success"));
    });
    builder.addCase(updateProduct.fulfilled, (state) => {
      state.items.unshift(make("Product updated successfully.", "info"));
    });
    builder.addCase(removeProduct.fulfilled, (state) => {
      state.items.unshift(make("Product deleted.", "error"));
    });

    // ── Orders ──
    builder.addCase(updateOrderStatus.fulfilled, (state, action) => {
      state.items.unshift(
        make(`Order status changed to "${action.payload.status}".`, "info"),
      );
    });
  },
});

export const { addNotification, markAsRead, markAllAsRead, clearAll } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
