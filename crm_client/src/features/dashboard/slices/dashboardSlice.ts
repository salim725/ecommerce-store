import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getStats,
  getRecentOrders,
  Stats,
  DashboardOrder,
} from "../services/dashboardApi";

interface DashboardState {
  stats: Stats | null;
  recentOrders: DashboardOrder[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  recentOrders: [],
  isLoading: false,
  error: null,
};

export const fetchDashboard = createAsyncThunk(
  "dashboard/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const [stats, recentOrders] = await Promise.all([
        getStats(),
        getRecentOrders(5),
      ]);
      return { stats, recentOrders };
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data &&
        typeof err.response.data.message === "string"
          ? err.response.data.message
          : "Failed to load dashboard data";
      return rejectWithValue(message);
    }
  },
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats;
        state.recentOrders = action.payload.recentOrders;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Failed to load dashboard data";
      });
  },
});

export default dashboardSlice.reducer;
