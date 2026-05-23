import type { AxiosResponse } from "axios";
import axiosInstance from "@/src/shared/services/axiosInstance";
import { unwrap } from "@/src/shared/services/apiResponse";
import {
  PRODUCT_CATEGORIES,
  type ProductCategory,
} from "@ecommerce/types";

export { PRODUCT_CATEGORIES, type ProductCategory };

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: ProductCategory;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface ProductFormInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: ProductCategory;
  imageFiles?: File[];
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  category?: ProductCategory;
}

interface ProductsListEnvelope {
  status: number;
  message: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: Product[];
}

function buildProductFormData(input: ProductFormInput): FormData {
  const formData = new FormData();
  formData.append("name", input.name);
  formData.append("description", input.description);
  formData.append("price", String(input.price));
  formData.append("stock", String(input.stock));
  formData.append("category", input.category);
  input.imageFiles?.forEach((file) => formData.append("images", file));
  return formData;
}

const multipartHeaders = { "Content-Type": "multipart/form-data" };

export const getProducts = async (
  params: GetProductsParams = {},
): Promise<Product[]> => {
  const response: AxiosResponse<ProductsListEnvelope> =
    await axiosInstance.get("products", {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 100,
        ...(params.category ? { category: params.category } : {}),
      },
    });
  return unwrap(response);
};

export const postProduct = async (input: ProductFormInput): Promise<Product> => {
  const response = await axiosInstance.post(
    "products",
    buildProductFormData(input),
    { headers: multipartHeaders },
  );
  return unwrap(response);
};

export const putProduct = async (
  id: string,
  input: ProductFormInput,
): Promise<Product> => {
  const response = await axiosInstance.put(
    `products/${id}`,
    buildProductFormData(input),
    { headers: multipartHeaders },
  );
  return unwrap(response);
};

export const deleteProduct = async (id: string): Promise<void> => {
  const response = await axiosInstance.delete(`products/${id}`);
  unwrap(response);
};
