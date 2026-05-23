import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import {
  Order,
  OrderStatus,
  GetOrdersParams,
  getOrders,
  putOrderStatus,
} from "../services/ordersApi";

interface OrdersState {
  items: Order[];
  page: number;
  totalPages: number;
  totalOrders: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  items: [],
  page: 1,
  totalPages: 1,
  totalOrders: 0,
  isLoading: false,
  error: null,
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

export const fetchOrders = createAsyncThunk(
  "orders/fetchAll",
  async (params: GetOrdersParams | undefined, { rejectWithValue }) => {
    try {
      return await getOrders(params);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch orders"));
    }
  },
);

export const updateOrderStatus = createAsyncThunk(
  "orders/updateStatus",
  async (
    { id, status }: { id: string; status: OrderStatus },
    { rejectWithValue },
  ) => {
    try {
      return await putOrderStatus(id, status);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update order status"),
      );
    }
  },
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchOrders.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchOrders.fulfilled, (state, action) => {
      state.isLoading = false;
      state.items = action.payload.orders;
      state.page = action.payload.page;
      state.totalPages = action.payload.totalPages;
      state.totalOrders = action.payload.totalOrders;
    });
    builder.addCase(fetchOrders.rejected, (state, action) => {
      state.isLoading = false;
      state.error = (action.payload as string) ?? "Failed to fetch orders";
    });

    builder.addCase(updateOrderStatus.fulfilled, (state, action) => {
      const index = state.items.findIndex((o) => o._id === action.payload._id);
      if (index !== -1) state.items[index] = action.payload;
    });
    builder.addCase(updateOrderStatus.rejected, (state, action) => {
      state.error =
        (action.payload as string) ?? "Failed to update order status";
    });
  },
});

export default ordersSlice.reducer;
