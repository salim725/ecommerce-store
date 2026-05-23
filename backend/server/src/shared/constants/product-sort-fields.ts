export const PRODUCT_SORT_FIELDS = [
  'price',
  'createdAt',
  'updatedAt',
  'name',
  'averageRating',
  'stock',
  'sold',
] as const

export type ProductSortField = (typeof PRODUCT_SORT_FIELDS)[number]

export const MAX_CATEGORY_PRODUCTS = 100
