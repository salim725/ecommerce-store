export const PRODUCT_CATEGORIES = [
  'clothing',
  'electronics',
  'food',
  'computers',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]
