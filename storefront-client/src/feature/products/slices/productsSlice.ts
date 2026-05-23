import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getProducts, getFeatured } from "../services/productsApi";

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  category: string;
  description?: string;
}

interface ProductsState {
  items: Product[];
  featured: Product[];
  selected: Product | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  featured: [],
  selected: null,
  isLoading: false,
  error: null,
};


type FetchProductsParams = {
  category?: string;
  page?: number;
  limit?: number;
};

export const fetchProducts = createAsyncThunk<
  Product[],
  FetchProductsParams | void,
  { rejectValue: string }
>(
    "products/fetchAll",
    async (params, { rejectWithValue }) => {
      try {
        const res = await getProducts(params || undefined);
        return res.data; // array of products
      } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || "Failed to load products");
      }
    }
  );
  
  export const fetchFeatured = createAsyncThunk(
    "products/fetchFeatured",
    async (_: void, { rejectWithValue }) => {
      try {
        const res = await getFeatured();
        return res.data;
      } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || "Failed to load featured");
      }
    }
  );


  const productsSlice = createSlice({
    name: "products",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      // fetchProducts
      builder
        .addCase(fetchProducts.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(fetchProducts.fulfilled, (state, action) => {
          state.isLoading = false;
          state.items = action.payload;
        })
        .addCase(fetchProducts.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload as string;
        });
  
      // fetchFeatured
      builder
        .addCase(fetchFeatured.fulfilled, (state, action) => {
          state.featured = action.payload;
        });
    },
  });
  
  export default productsSlice.reducer;