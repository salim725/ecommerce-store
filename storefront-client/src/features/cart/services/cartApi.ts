import axiosInstance from "@/src/shared/services/axiosInstance";

export const getCart = () => axiosInstance.get("/cart");

export const addToCart = (productId: string, quantity: number) =>
  axiosInstance.post("/cart", { productId, quantity });

export const updateCartItem = (productId: string, quantity: number) =>
  axiosInstance.put(`/cart/${productId}`, { quantity });

export const removeCartItem = (productId: string) =>
  axiosInstance.delete(`/cart/${productId}`);

export const syncCart = (
  localItems: { productId: string; quantity: number }[],
) => axiosInstance.post("/cart/sync", { items: localItems });
