import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  isModalOpen: boolean;
  modalType: string | null;
}

const initialState: UiState = {
  isModalOpen: false,
  modalType: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openModal(state, action: PayloadAction<string>) {
      state.isModalOpen = true;
      state.modalType = action.payload;
    },
    closeModal(state) {
      state.isModalOpen = false;
      state.modalType = null;
    },
  },
});

export const {openModal,closeModal}=uiSlice.actions
export default uiSlice.reducer;
