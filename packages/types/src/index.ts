export const PRODUCT_CATEGORIES = [
  'clothing',
  'electronics',
  'food',
  'computers',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

export type UserRole = 'customer' | 'admin'

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type PaymentMethod = 'paypal' | 'credit' | 'simulated' | 'visa'

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
}

export interface ApiUser {
  id: string
  name: string
  email: string
  role: UserRole
  isVerified?: boolean
}

export interface ApiSuccessEnvelope<T> {
  success: true
  status: number
  message: string
  data: T
  page?: number
  limit?: number
  total?: number
  totalPages?: number
  pagination?: PaginationMeta
}

export interface ApiErrorEnvelope {
  success: false
  status: number
  message: string
  data: null
  errors?: Record<string, string> | string[]
}

export interface ApiProductReview {
  _id?: string
  user: { _id?: string; name: string } | string
  rating: number
  comment?: string
  createdAt?: string
  updatedAt?: string
}

export interface ProductReviewsPayload {
  reviews: ApiProductReview[]
  averageRating: number
  totalReviews: number
}

export interface ApiProduct {
  _id: string
  name: string
  description: string
  price: number
  category: ProductCategory
  images: string[]
  stock: number
  sold?: number
  averageRating?: number
}

export interface ApiOrderItem {
  product: string
  name: string
  price: number
  quantity: number
  image?: string
}

export interface ApiShippingAddress {
  street: string
  city: string
  zipCode: string
  country: string
}

export interface ApiOrder {
  _id: string
  user: string
  items: ApiOrderItem[]
  shippingAddress: ApiShippingAddress
  totalPrice: number
  paymentMethod: PaymentMethod
  status: OrderStatus
  createdAt?: string
}
