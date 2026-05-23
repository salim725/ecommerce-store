import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [] as any[], isLoading: false, error: null },
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: any; quantity: number }>) => {
      state.items.push(action.payload); // temporary — real logic comes in Step 6
    },
  },
});

export const { addToCart } = cartSlice.actions;
export default cartSlice.reducer;