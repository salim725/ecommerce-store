import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  isModalOpen: boolean;
  modalType: string | null;  // e.g. "confirmDelete", "imagePreview"
}

const initialState: UiState = {
  isModalOpen: false,
  modalType: null,
};

//This slice manages global UI state — things that multiple components need to know 
// about, like whether a modal is open.
const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
      openModal: (state, action: PayloadAction<string>) => {
        state.isModalOpen = true;
        state.modalType = action.payload; // which modal to show
      },
      closeModal: (state) => {
        state.isModalOpen = false;
        state.modalType = null;
      },
    },
  });
  
  export const { openModal, closeModal } = uiSlice.actions;
  export default uiSlice.reducer;

  //openModal("confirmDelete") sets modalType so any component can check which 
  // modal to render. closeModal resets everything.