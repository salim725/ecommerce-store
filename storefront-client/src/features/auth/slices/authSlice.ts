import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setAuthToken, clearAuthToken } from "@/src/shared/utils/authToken";
import { authApi } from "../api/authApi";
import { updateProfile } from "@/src/features/profile/slices/profileSlice";
import { getErrorMessage } from "@/src/shared/utils/getErrorMessage";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};
// REGISTER thunk — no auto-login; user must verify email first
export const register = createAsyncThunk(
  "auth/register",
  async (
    data: { name: string; email: string; password: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      await dispatch(
        authApi.endpoints.register.initiate(data),
      ).unwrap();
      return { email: data.email };
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Registration failed"));
    }
  },
);
//createAsyncThunk handles the async call. On success it saves the JWT to localStorage.
// On failure it passes the error message back to the slice.

// LOGIN thunk
export const login = createAsyncThunk(
  "auth/login",
  async (
    credentials: { email: string; password: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const result = await dispatch(
        authApi.endpoints.login.initiate(credentials),
      ).unwrap();
      setAuthToken(result.token);
      return result;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Login failed"));
    }
  },
);

// LOGOUT thunk
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      await dispatch(authApi.endpoints.logout.initiate()).unwrap();
    } catch {
      // Clear local session even if the API call fails
    }
    clearAuthToken();
  },
);

// GETME thunk — rehydrate session on app start
export const fetchMe = createAsyncThunk(
  "auth/getMe",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      return await dispatch(
        authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }),
      ).unwrap();
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Session expired"));
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // REGISTER
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // LOGIN
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        // mergeCarts is dispatched from the component after login — see LoginForm update below
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // LOGOUT
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    })

    // GETME
    builder
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        clearAuthToken();
      });

    // Profile updates — keep auth.user in sync with profile edits
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.user = action.payload;
    });
  },
});

export default authSlice.reducer;

//extraReducers handles the 3 states of every async thunk — pending (loading),
//  fulfilled (success), rejected (error).
