import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  miniCartOpen: boolean;
}

const initialState: UiState = {
  miniCartOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openMiniCart: (state) => {
      state.miniCartOpen = true;
    },
    closeMiniCart: (state) => {
      state.miniCartOpen = false;
    },
    setMiniCartOpen: (state, action: PayloadAction<boolean>) => {
      state.miniCartOpen = action.payload;
    },
  },
});

export const { openMiniCart, closeMiniCart, setMiniCartOpen } = uiSlice.actions;
export const selectMiniCartOpen = (state: { ui: UiState }) => state.ui.miniCartOpen;

export default uiSlice.reducer;
