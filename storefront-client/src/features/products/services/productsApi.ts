import axiosInstance from "@/src/shared/services/axiosInstance";

export const getProducts = (params?: {
  category?: string;
  page?: number;
  limit?: number;
  sort?: string;
}) => axiosInstance.get("/products", { params });

export const getFeatured = () =>
  axiosInstance.get("/products", {
    params: { sort: "-createdAt", limit: 8 },
  });

export const getProductReviews = (productId: string) =>
  axiosInstance.get(`/products/${productId}/reviews`);
