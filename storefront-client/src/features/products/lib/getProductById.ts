import { cache } from "react";
import type { Product } from "./getProductsServer";
import { fetchProductsJson } from "./getProductsServer";

export const getProductByIdServer = cache(
  async (id: string): Promise<Product | null> => {
    try {
      return await fetchProductsJson<Product>(`/products/${id}`);
    } catch {
      return null;
    }
  },
);
