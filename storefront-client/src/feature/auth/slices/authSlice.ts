import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
} from "../services/authApi";

interface User {
  _id: string;
  name: string;
  email: string;
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
// REGISTER thunk
export const register = createAsyncThunk(
  "auth/register",
  async (
    data: { name: string; email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await registerUser(data);
      localStorage.setItem("sf_token", res.data.token); // save token
      return res.data; // { user, token }
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Registration failed",
      );
    }
  },
);
//createAsyncThunk handles the async call. On success it saves the JWT to localStorage. 
// On failure it passes the error message back to the slice.


// LOGIN thunk
export const login = createAsyncThunk(
    "auth/login",
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
      try {
        const res = await loginUser(credentials);
        localStorage.setItem("sf_token", res.data.token);
        return res.data;
      } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || "Login failed");
      }
    }
  );
  
  // LOGOUT thunk
  export const logout = createAsyncThunk("auth/logout", async () => {
    await logoutUser();
    localStorage.removeItem("sf_token"); // clear the token
  });
  
  // GETME thunk — rehydrate session on app start
  export const fetchMe = createAsyncThunk(
    "auth/getMe",
    async (_, { rejectWithValue }) => {
      try {
        const res = await getMe();
        return res.data;
      } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || "Session expired");
      }
    }
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
        .addCase(register.fulfilled, (state, action) => {
          state.isLoading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        })
        .addCase(register.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload as string;
        });
  
      // LOGIN
      builder
        .addCase(login.pending, (state) => { state.isLoading = true; state.error = null; })
        .addCase(login.fulfilled, (state, action) => {
          state.isLoading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
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
      });
  
      // GETME
      builder
        .addCase(fetchMe.fulfilled, (state, action) => {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        })
        .addCase(fetchMe.rejected, (state) => {
          state.isAuthenticated = false;
          state.user = null;
        });
    },
  });
  
  export default authSlice.reducer;


  //extraReducers handles the 3 states of every async thunk — pending (loading),
  //  fulfilled (success), rejected (error).