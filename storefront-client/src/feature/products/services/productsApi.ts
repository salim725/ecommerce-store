import axiosInstance from "@/src/shared/services/axiosInstance";

export const getProducts = (params?: {
  category?: string;
  page?: number;
  limit?: number;
}) => axiosInstance.get("/products", { params });
//params gets serialized as query strings automatically — so getProducts({ category: "shoes", page: 1 }) 
// becomes /products?category=shoes&page=1
export const getFeatured = () =>
    axiosInstance.get("/products/featured");
//Fetches the featured/newest products used in the hero carousel.