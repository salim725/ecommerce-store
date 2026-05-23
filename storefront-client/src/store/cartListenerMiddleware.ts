import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { addItem } from "@/src/features/cart/slices/cartSlice";
import { openMiniCart } from "@/src/store/slices/uiSlice";

export const cartListenerMiddleware = createListenerMiddleware();

cartListenerMiddleware.startListening({
  matcher: isAnyOf(addItem.fulfilled),
  effect: (_action, api) => {
    api.dispatch(openMiniCart());
  },
});
