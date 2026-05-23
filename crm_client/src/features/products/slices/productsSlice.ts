import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import {
  Product,
  ProductFormInput,
  GetProductsParams,
  getProducts,
  postProduct,
  putProduct,
  deleteProduct,
} from "../services/productsApi";

interface ProductsState {
  items: Product[];
  isLoading: boolean;
  error: string | null;
  selected: Product | null;
}

const initialState: ProductsState = {
  items: [],
  isLoading: false,
  error: null,
  selected: null,
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (params: GetProductsParams | undefined, { rejectWithValue }) => {
    try {
      return await getProducts(params);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch products"));
    }
  },
);

export const createProduct = createAsyncThunk(
  "products/create",
  async (input: ProductFormInput, { rejectWithValue }) => {
    try {
      return await postProduct(input);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to create product"));
    }
  },
);

export const updateProduct = createAsyncThunk(
  "products/update",
  async (
    { id, input }: { id: string; input: ProductFormInput },
    { rejectWithValue },
  ) => {
    try {
      return await putProduct(id, input);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update product"));
    }
  },
);

export const removeProduct = createAsyncThunk(
  "products/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteProduct(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete product"));
    }
  },
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setSelected(state, action: PayloadAction<Product | null>) {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProducts.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.isLoading = false;
      state.error = (action.payload as string) ?? "Failed to fetch products";
    });

    builder.addCase(createProduct.fulfilled, (state, action) => {
      state.items.push(action.payload);
    });
    builder.addCase(createProduct.rejected, (state, action) => {
      state.error = (action.payload as string) ?? "Failed to create product";
    });

    builder.addCase(updateProduct.fulfilled, (state, action) => {
      const index = state.items.findIndex((p) => p._id === action.payload._id);
      if (index !== -1) state.items[index] = action.payload;
    });
    builder.addCase(updateProduct.rejected, (state, action) => {
      state.error = (action.payload as string) ?? "Failed to update product";
    });

    builder.addCase(removeProduct.fulfilled, (state, action) => {
      state.items = state.items.filter((p) => p._id !== action.payload);
    });
  },
});

export const { setSelected } = productsSlice.actions;
export default productsSlice.reducer;
