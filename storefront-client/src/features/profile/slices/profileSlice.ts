import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { User } from "@/src/features/auth/slices/authSlice";
import * as profileApi from "../services/profileApi";
import { getErrorMessage } from "@/src/shared/utils/getErrorMessage";
import { extractApiData } from "@/src/shared/utils/extractApiData";
import { mapUserFromApi } from "@/src/shared/utils/mapUserFromApi";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  _id: string;
  createdAt: string;
  orderStatus: OrderStatus;
  items: { product: { name: string; price: number }; quantity: number }[];
  totalPrice: number;
}

interface ProfileState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  orders: [],
  isLoading: false,
  error: null,
};

export const updateProfile = createAsyncThunk(
  "profile/update",
  async (data: { name?: string; phone?: string; address?: string }, { rejectWithValue }) => {
    try {
      const res = await profileApi.updateProfile({ name: data.name });
      const user = extractApiData<Parameters<typeof mapUserFromApi>[0]>(res.data);
      return mapUserFromApi(user);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Update failed"));
    }
  },
);

export const changePassword = createAsyncThunk(
  "profile/changePassword",
  async (
    data: { oldPassword: string; newPassword: string },
    { rejectWithValue },
  ) => {
    try {
      await profileApi.changePassword(data);
      return true;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Password change failed"));
    }
  },
);

export const fetchMyOrders = createAsyncThunk(
  "profile/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const res = await profileApi.getMyOrders();
      return extractApiData<Order[]>(res.data);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to load orders"));
    }
  },
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default profileSlice.reducer;
