import {
  PRODUCT_CATEGORIES,
  type ProductCategory,
} from "@ecommerce/types";

export { PRODUCT_CATEGORIES, type ProductCategory };

/** Category filter options for PLP, home tiles, and cart empty state. */
export const PRODUCT_CATEGORY_LIST: string[] = [...PRODUCT_CATEGORIES];
