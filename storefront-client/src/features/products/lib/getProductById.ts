import { cache } from "react";
import {
  fetchProductByIdServer,
  type Product,
} from "./getProductsServer";

export const getProductByIdServer = cache(fetchProductByIdServer);

export type { Product };
