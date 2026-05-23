import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  User,
  UpdateRolePayload,
  getUsers,
  putUserRole,
  deleteUser,
} from "../services/usersApi";

interface UsersState {
  items: User[];
  isLoading: boolean;
  error: string | null;
  selected: User | null;
}

const initialState: UsersState = {
  items: [],
  isLoading: false,
  error: null,
  selected: null,
};

export const fetchUsers = createAsyncThunk("users/fetchAll", async () => {
  return await getUsers();
});

export const updateUser = createAsyncThunk(
  "users/update",
  async ({ id, payload }: { id: string; payload: UpdateRolePayload }) => {
    return await putUserRole(id, payload);
  },
);

export const removeUser = createAsyncThunk("users/delete", async (id: string) => {
  await deleteUser(id);
  return id;
});

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setSelected(state, action: PayloadAction<User | null>) {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUsers.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.isLoading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message ?? "Failed to fetch users";
    });

    builder.addCase(updateUser.fulfilled, (state, action) => {
      const index = state.items.findIndex(
        (u) => u._id === String(action.payload.id),
      );
      if (index !== -1) {
        state.items[index] = {
          ...state.items[index],
          role: action.payload.role,
        };
      }
    });

    builder.addCase(removeUser.fulfilled, (state, action) => {
      state.items = state.items.filter((u) => u._id !== action.payload);
    });
  },
});

export const { setSelected } = usersSlice.actions;
export default usersSlice.reducer;
