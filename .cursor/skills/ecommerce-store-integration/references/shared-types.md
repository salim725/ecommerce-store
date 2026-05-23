# Shared TypeScript Types — ecommerce-store

These types map directly to Mongoose schemas. Use them in both frontend projects.
Both `crm_client/types/index.ts` and `store_front/types/index.ts` should export these.

---

## Base Types

```ts
export interface Timestamps {
  createdAt: string; // ISO date string from API
  updatedAt: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
}
```

---

## User

```ts
// Mongoose schema fields: name, email, password (excluded), role, isActive, avatar, phone, address
export interface UserPublic extends Timestamps {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  avatar?: string;
  phone?: string;
  address?: Address;
}

export interface AuthState {
  user: UserPublic | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}
```

---

## Address

```ts
export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}
```

---

## Category

```ts
export interface Category extends Timestamps {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  parent?: string | Category; // ObjectId or populated
  productCount?: number;      // virtual, not always present
}

export interface CategoryState {
  items: Category[];
  selected: Category | null;
  isLoading: boolean;
  error: string | null;
  pagination: PaginationMeta | null;
}
```

---

## Product

```ts
export interface ProductImage {
  url: string;
  publicId: string;
  isPrimary?: boolean;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface Product extends Timestamps {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  sku?: string;
  stock: number;
  category: string | Category; // ObjectId or populated
  images: ProductImage[];
  tags: string[];
  featured: boolean;
  isActive: boolean;
  attributes: ProductAttribute[];
  averageRating?: number;   // virtual
  reviewCount?: number;     // virtual
}

export interface ProductState {
  items: Product[];
  selected: Product | null;
  isLoading: boolean;
  error: string | null;
  pagination: PaginationMeta | null;
  filters: ProductFilters;
}

export interface ProductFilters {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  featured?: boolean;
}
```

---

## Order

```ts
export interface OrderItem {
  product: string | Product; // ObjectId or populated
  name: string;              // snapshot at time of order
  price: number;             // snapshot
  quantity: number;
  image?: string;            // snapshot
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentMethod = 'cod' | 'card' | 'paypal';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order extends Timestamps {
  _id: string;
  orderNumber: string;
  user: string | UserPublic;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  couponCode?: string;
  trackingNumber?: string;
}

export interface OrderState {
  items: Order[];
  selected: Order | null;
  isLoading: boolean;
  error: string | null;
  pagination: PaginationMeta | null;
}

export interface CreateOrderInput {
  items: { product: string; quantity: number }[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
}
```

---

## Review

```ts
export interface Review extends Timestamps {
  _id: string;
  user: string | UserPublic;
  product: string;
  rating: number;   // 1–5
  title?: string;
  body: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
}
```

---

## Cart (client-side only — NOT persisted to backend)

```ts
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  isLoading: boolean; // for optimistic update rollbacks
}
```

---

## Dashboard Analytics

```ts
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  pendingOrders: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}
```