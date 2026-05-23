# API Contracts — ecommerce-store

Base URL pattern: `GET /api/v1/<resource>`

All endpoints require `Authorization: Bearer <token>` unless marked **[public]**.

---

## Standard Response Envelopes

```ts
// Success
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  pagination?: PaginationMeta;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Error
interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string>; // field-level validation errors from Joi
}
```

---

## Auth Routes (`/api/v1/auth`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | [public] | Register new user |
| POST | `/auth/login` | [public] | Login, returns token + sets cookie |
| POST | `/auth/refresh` | cookie | Refresh access token |
| POST | `/auth/logout` | Bearer | Logout, clear cookie |
| GET | `/auth/me` | Bearer | Get current user profile |
| PUT | `/auth/me` | Bearer | Update profile |
| PUT | `/auth/change-password` | Bearer | Change password |
| POST | `/auth/forgot-password` | [public] | Send reset email |
| POST | `/auth/reset-password/:token` | [public] | Reset password |

### POST `/auth/register`
```ts
// Request
{ name: string; email: string; password: string; }
// Response data
{ user: UserPublic; token: string; }
```

### POST `/auth/login`
```ts
// Request
{ email: string; password: string; }
// Response data
{ user: UserPublic; token: string; }
// Side effect: sets httpOnly cookie "refreshToken"
```

---

## User Routes (`/api/v1/users`) — Admin only

| Method | Path | Description |
|---|---|---|
| GET | `/users` | List users (paginated) |
| GET | `/users/:id` | Get user by ID |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |

### GET `/users` Query Params
```
page, limit, sort, order, search (name/email), role, isActive
```

---

## Product Routes (`/api/v1/products`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/products` | [public] | List products |
| GET | `/products/:id` | [public] | Get product |
| GET | `/products/slug/:slug` | [public] | Get product by slug |
| POST | `/products` | Admin | Create product |
| PUT | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Delete product |
| POST | `/products/:id/images` | Admin | Upload images |
| DELETE | `/products/:id/images/:imageId` | Admin | Remove image |

### GET `/products` Query Params
```
page, limit, sort, order
category (id), minPrice, maxPrice, inStock (bool), search (name/description), featured (bool)
```

### POST `/products` Request Body
```ts
{
  name: string;
  slug?: string;           // auto-generated from name if omitted
  description: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  sku?: string;
  stock: number;
  category: string;        // ObjectId
  tags?: string[];
  featured?: boolean;
  isActive?: boolean;
  attributes?: { name: string; value: string }[];
}
// Images uploaded separately via multipart/form-data to /products/:id/images
```

---

## Category Routes (`/api/v1/categories`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/categories` | [public] | List categories |
| GET | `/categories/:id` | [public] | Get category |
| GET | `/categories/slug/:slug` | [public] | Get by slug |
| POST | `/categories` | Admin | Create |
| PUT | `/categories/:id` | Admin | Update |
| DELETE | `/categories/:id` | Admin | Delete |

---

## Order Routes (`/api/v1/orders`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/orders` | Bearer | Create order (storefront) |
| GET | `/orders` | Admin | List all orders |
| GET | `/orders/my` | Bearer | List current user's orders |
| GET | `/orders/:id` | Bearer | Get order (own or admin) |
| PUT | `/orders/:id/status` | Admin | Update status |
| PUT | `/orders/:id/cancel` | Bearer | Cancel order (own) |

### POST `/orders` Request Body
```ts
{
  items: { product: string; quantity: number }[];
  shippingAddress: Address;
  paymentMethod: 'cod' | 'card' | 'paypal';
  couponCode?: string;
  notes?: string;
}
```

### Order Status Values
```ts
type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
```

---

## Review Routes (`/api/v1/reviews`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/reviews` | Bearer | Create review |
| GET | `/reviews/product/:productId` | [public] | Get product reviews |
| PUT | `/reviews/:id` | Bearer | Update own review |
| DELETE | `/reviews/:id` | Bearer/Admin | Delete review |

---

## Upload Routes (`/api/v1/upload`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/upload/image` | Admin | Upload single image → Cloudinary |
| POST | `/upload/images` | Admin | Upload multiple images |
| DELETE | `/upload/image` | Admin | Delete image from Cloudinary |

### POST `/upload/image`
```
Content-Type: multipart/form-data
field name: "image"
```
```ts
// Response data
{ url: string; publicId: string; }
```

---

## Dashboard / Analytics (`/api/v1/dashboard`) — Admin only

| Method | Path | Description |
|---|---|---|
| GET | `/dashboard/stats` | Summary counts (orders, revenue, users, products) |
| GET | `/dashboard/revenue` | Revenue over time (query: `period=7d|30d|90d|1y`) |
| GET | `/dashboard/top-products` | Best-selling products |
| GET | `/dashboard/recent-orders` | Latest N orders |

### GET `/dashboard/stats` Response
```ts
{
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  pendingOrders: number;
  revenueGrowth: number;  // % vs previous period
  ordersGrowth: number;
}
```