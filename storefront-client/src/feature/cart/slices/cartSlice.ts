import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as cartApi from "../services/cartApi";

export interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
  quantity: number;
}

// Guest cart item shape (stored in localStorage)
interface GuestCartItem {
  product: CartItem["product"];
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  isLoading: false,
  error: null,
};

const GUEST_CART_KEY = "guest_cart";

const getGuestCart = (): GuestCartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveGuestCart = (items: GuestCartItem[]) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

const clearGuestCart = () => {
  localStorage.removeItem(GUEST_CART_KEY);
};
//We wrap localStorage in try/catch because it can throw in private browsing mode or if storage is full.
// Fetch cart from backend (logged-in users)
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const res = await cartApi.getCart();
      return res.data.items as CartItem[];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch cart",
      );
    }
  },
);
// Add item — backend if logged in, localStorage if guest
export const addItem = createAsyncThunk(
  "cart/addItem",
  async (
    {
      product,
      quantity,
      isAuthenticated,
    }: {
      product: CartItem["product"];
      quantity: number;
      isAuthenticated: boolean;
    },
    { rejectWithValue },
  ) => {
    try {
      if (isAuthenticated) {
        // Sync with backend
        const res = await cartApi.addToCart(product._id, quantity);
        return { items: res.data.items as CartItem[], isAuthenticated };
      } else {
        // Save to localStorage
        const guestCart = getGuestCart();
        const existing = guestCart.find((i) => i.product._id === product._id);
        if (existing) {
          existing.quantity += quantity; // increase quantity if already in cart
        } else {
          guestCart.push({ product, quantity });
        }
        saveGuestCart(guestCart);
        return { guestCart, isAuthenticated };
      }
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add item",
      );
    }
  },
);
//This single thunk handles both cases. If the user is logged in →
//  API call. If guest → localStorage. The component doesn't need to know which path was taken.

// Update item quantity
export const updateItem = createAsyncThunk(
  "cart/updateItem",
  async (
    {
      itemId,
      quantity,
      isAuthenticated,
    }: {
      itemId: string;
      quantity: number;
      isAuthenticated: boolean;
    },
    { rejectWithValue },
  ) => {
    try {
      if (isAuthenticated) {
        const res = await cartApi.updateCartItem(itemId, quantity);
        return { items: res.data.items as CartItem[], isAuthenticated };
      } else {
        const guestCart = getGuestCart();
        const item = guestCart.find((i) => i.product._id === itemId);
        if (item) item.quantity = quantity;
        saveGuestCart(guestCart);
        return { guestCart, isAuthenticated };
      }
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update item",
      );
    }
  },
);

// Remove item
export const removeItem = createAsyncThunk(
  "cart/removeItem",
  async (
    { itemId, isAuthenticated }: { itemId: string; isAuthenticated: boolean },
    { rejectWithValue },
  ) => {
    try {
      if (isAuthenticated) {
        const res = await cartApi.removeCartItem(itemId);
        return { items: res.data.items as CartItem[], isAuthenticated };
      } else {
        const guestCart = getGuestCart().filter(
          (i) => i.product._id !== itemId,
        );
        saveGuestCart(guestCart);
        return { guestCart, isAuthenticated };
      }
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to remove item",
      );
    }
  },
);

// Called right after login — merge guest cart into user cart
export const mergeCarts = createAsyncThunk(
  "cart/merge",
  async (_, { rejectWithValue }) => {
    try {
      const guestCart = getGuestCart();
      if (guestCart.length === 0) {
        // No guest items — just fetch the user's existing cart
        const res = await cartApi.getCart();
        return res.data.items as CartItem[];
      }
      const localItems = guestCart.map((i) => ({
        productId: i.product._id,
        quantity: i.quantity,
      }));
      const res = await cartApi.mergeCart(localItems);
      clearGuestCart(); // clean up localStorage after successful merge
      return res.data.items as CartItem[];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to merge cart",
      );
    }
  },
);
//After the merge succeeds, we clear the guest cart from localStorage. The server is now the source of truth.
// Helper — convert guest cart (no _id) into CartItem shape for Redux
const guestToCartItems = (guestCart: GuestCartItem[]): CartItem[] =>
  guestCart.map((i) => ({
    _id: i.product._id, // use product _id as item _id for guest
    product: i.product,
    quantity: i.quantity,
  }));

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Called on app start — load guest cart into Redux from localStorage
    loadGuestCart: (state) => {
      state.items = guestToCartItems(getGuestCart());
    },
    // Called on logout — clear Redux cart state
    clearCart: (state) => {
      state.items = [];
    },
    // Kept for ProductCard compatibility from Step 4
    addToCart: (
      state,
      action: PayloadAction<{ product: CartItem["product"]; quantity: number }>,
    ) => {
      const { product, quantity } = action.payload;
      const existing = state.items.find((i) => i.product._id === product._id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ _id: product._id, product, quantity });
      }
    },
  },
  extraReducers: (builder) => {
    // fetchCart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // addItem, updateItem, removeItem — all return same shape
    const syncFulfilled = (state: CartState, action: any) => {
      state.isLoading = false;
      if (action.payload.isAuthenticated) {
        state.items = action.payload.items;
      } else {
        state.items = guestToCartItems(action.payload.guestCart);
      }
    };

    builder
      .addCase(addItem.fulfilled, syncFulfilled)
      .addCase(updateItem.fulfilled, syncFulfilled)
      .addCase(removeItem.fulfilled, syncFulfilled);

    // mergeCarts
    builder.addCase(mergeCarts.fulfilled, (state, action) => {
      state.items = action.payload;
    });
  },
});

export const { loadGuestCart, clearCart, addToCart } = cartSlice.actions;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);

export default cartSlice.reducer;
