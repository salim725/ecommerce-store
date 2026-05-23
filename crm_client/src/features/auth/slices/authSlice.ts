import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import {
  AuthUser,
  LoginCredentials,
  loginAdmin,
  Verify2FaPayload,
  verifyAdmin2Fa,
  getMe,
} from "../services/authApi";
import {
  setAuthToken,
  clearAuthToken,
  getAuthToken,
} from "@/src/shared/utils/authToken";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  pendingEmail: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  pendingEmail: null,
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

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      await loginAdmin(credentials);
      return credentials.email;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Invalid email or password"),
      );
    }
  },
);

export const verify2FA = createAsyncThunk(
  "auth/verify2FA",
  async (payload: Verify2FaPayload, { rejectWithValue }) => {
    try {
      const { token } = await verifyAdmin2Fa(payload);
      setAuthToken(token);
      const user = await getMe();
      if (user.role !== "admin") {
        clearAuthToken();
        return rejectWithValue("Admin access required");
      }
      return { token, user };
    } catch (error) {
      clearAuthToken();
      return rejectWithValue(getErrorMessage(error, "Invalid OTP code"));
    }
  },
);

export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const user = await getMe();
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue("Not authenticated");
      }
      return { token, user };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load profile"));
    }
  },
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.pendingEmail = null;
      clearAuthToken();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingEmail = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Login failed";
      })

      .addCase(verify2FA.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verify2FA.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.pendingEmail = null;
      })
      .addCase(verify2FA.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "OTP failed";
      })

      .addCase(fetchMe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.user.role !== "admin") {
          state.user = null;
          state.token = null;
          state.pendingEmail = null;
          clearAuthToken();
          return;
        }
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Failed to load profile";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
