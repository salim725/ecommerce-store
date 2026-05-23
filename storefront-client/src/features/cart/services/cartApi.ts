import axiosInstance from "@/src/shared/services/axiosInstance";

export const getCart = () => axiosInstance.get("/cart");
//Fetches the logged-in user's cart from the database.
export const addToCart = (productId: string, quantity: number) =>
  axiosInstance.post("/cart", { productId, quantity });

export const updateCartItem = (itemId: string, quantity: number) =>
  axiosInstance.put(`/cart/${itemId}`, { quantity });

export const removeCartItem = (itemId: string) =>
  axiosInstance.delete(`/cart/${itemId}`);
export const mergeCart = (
  localItems: { productId: string; quantity: number }[],
) => axiosInstance.post("/cart/merge", { items: localItems });
//This is the key sync endpoint — called right after login.
//  It sends the guest cart items to the backend which merges them into the user's existing cart.