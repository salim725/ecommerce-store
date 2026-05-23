import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as profileApi from "../services/profileApi";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface Order {
  _id: string;
  createdAt: string;
  status: "pending" | "paid" | "shipped" | "cancelled";
  items: { product: { name: string; price: number }; quantity: number }[];
  totalPrice: number;
}

interface ProfileState {
  profile: User | null;
  orders: Order[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  orders: [],
  isLoading: false,
  error: null,
};
export const fetchProfile = createAsyncThunk(
    "profile/fetchProfile",
    async (_, { rejectWithValue }) => {
      try {
        const res = await profileApi.getMe();
        return res.data.user;
      } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || "Failed to load profile");
      }
    }
  );
  
  export const updateProfile = createAsyncThunk(
    "profile/update",
    async (
      data: { name?: string; phone?: string; address?: string },
      { rejectWithValue }
    ) => {
      try {
        const res = await profileApi.updateProfile(data);
        return res.data.user; // backend returns updated user
      } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || "Update failed");
      }
    }
  );
  
  export const changePassword = createAsyncThunk(
    "profile/changePassword",
    async (
      data: { oldPassword: string; newPassword: string },
      { rejectWithValue }
    ) => {
      try {
        await profileApi.changePassword(data);
        return true;
      } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || "Password change failed");
      }
    }
  );
  
  export const fetchMyOrders = createAsyncThunk(
    "profile/fetchOrders",
    async (_, { rejectWithValue }) => {
      try {
        const res = await profileApi.getMyOrders();
        return res.data.orders as Order[];
      } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || "Failed to load orders");
      }
    }
  );

  const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      // fetchProfile
      builder
        .addCase(fetchProfile.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(fetchProfile.fulfilled, (state, action) => {
          state.isLoading = false;
          state.profile = action.payload;
        })
        .addCase(fetchProfile.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload as string;
        });
  
      // updateProfile — update profile in state without refetching
      builder
        .addCase(updateProfile.pending, (state) => { state.isLoading = true; })
        .addCase(updateProfile.fulfilled, (state, action) => {
          state.isLoading = false;
          state.profile = action.payload; // replace with updated user
        })
        .addCase(updateProfile.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload as string;
        });
  
      // changePassword — no state change needed on success
      builder
        .addCase(changePassword.pending, (state) => { state.isLoading = true; })
        .addCase(changePassword.fulfilled, (state) => { state.isLoading = false; })
        .addCase(changePassword.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload as string;
        });
  
      // fetchMyOrders
      builder
        .addCase(fetchMyOrders.pending, (state) => { state.isLoading = true; })
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