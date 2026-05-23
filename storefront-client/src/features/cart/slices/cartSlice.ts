import {
  createSlice,
  createAsyncThunk,
  createSelector,
  PayloadAction,
} from "@reduxjs/toolkit";
import { cartApi } from "../api/cartApi";
import { getErrorMessage } from "@/src/shared/utils/getErrorMessage";

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
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(
        cartApi.endpoints.getCart.initiate(undefined, { forceRefetch: true }),
      ).unwrap();
      return result.items;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to fetch cart"));
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
    { dispatch, rejectWithValue },
  ) => {
    try {
      if (isAuthenticated) {
        const result = await dispatch(
          cartApi.endpoints.addToCart.initiate({
            productId: product._id,
            quantity,
          }),
        ).unwrap();
        return { items: result.items, isAuthenticated };
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
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to add item"));
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
    { dispatch, rejectWithValue },
  ) => {
    try {
      if (isAuthenticated) {
        const result = await dispatch(
          cartApi.endpoints.updateCartItem.initiate({
            productId: itemId,
            quantity,
          }),
        ).unwrap();
        return { items: result.items, isAuthenticated };
      } else {
        const guestCart = getGuestCart();
        const item = guestCart.find((i) => i.product._id === itemId);
        if (item) item.quantity = quantity;
        saveGuestCart(guestCart);
        return { guestCart, isAuthenticated };
      }
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to update item"));
    }
  },
);

// Remove item
export const removeItem = createAsyncThunk(
  "cart/removeItem",
  async (
    { itemId, isAuthenticated }: { itemId: string; isAuthenticated: boolean },
    { dispatch, rejectWithValue },
  ) => {
    try {
      if (isAuthenticated) {
        const result = await dispatch(
          cartApi.endpoints.removeCartItem.initiate(itemId),
        ).unwrap();
        return { items: result.items, isAuthenticated };
      } else {
        const guestCart = getGuestCart().filter(
          (i) => i.product._id !== itemId,
        );
        saveGuestCart(guestCart);
        return { guestCart, isAuthenticated };
      }
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to remove item"));
    }
  },
);

// Called right after login — merge guest cart into user cart
export const mergeCarts = createAsyncThunk(
  "cart/merge",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const guestCart = getGuestCart();
      if (guestCart.length === 0) {
        const result = await dispatch(
          cartApi.endpoints.getCart.initiate(undefined, {
            forceRefetch: true,
          }),
        ).unwrap();
        return result.items;
      }
      const localItems = guestCart.map((i) => ({
        productId: i.product._id,
        quantity: i.quantity,
      }));
      const result = await dispatch(
        cartApi.endpoints.syncCart.initiate({ items: localItems }),
      ).unwrap();
      clearGuestCart();
      return result.items;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to merge cart"));
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
    type CartMutationPayload =
      | { items: CartItem[]; isAuthenticated: true }
      | { guestCart: GuestCartItem[]; isAuthenticated: false };

    const syncFulfilled = (
      state: CartState,
      action: PayloadAction<CartMutationPayload>,
    ) => {
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
const selectCartState = (state: { cart: CartState }) => state.cart;

export const selectCartItems = createSelector(
  selectCartState,
  (cart) => cart.items,
);

export const selectCartTotal = createSelector(selectCartItems, (items) =>
  items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
);

export const selectCartCount = createSelector(selectCartItems, (items) =>
  items.reduce((sum, i) => sum + i.quantity, 0),
);

export default cartSlice.reducer;
