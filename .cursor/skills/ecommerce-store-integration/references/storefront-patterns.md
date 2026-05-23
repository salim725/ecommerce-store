# Storefront Patterns — store_front

---

## SSR / SSG Strategy by Page Type

| Page | Strategy | Reason |
|---|---|---|
| `/` (home) | ISR (revalidate: 3600) | Featured products change infrequently |
| `/products` | ISR (revalidate: 300) | Product list changes, but not per-request |
| `/products/[slug]` | SSR | Price/stock must be fresh per request |
| `/categories/[slug]` | ISR (revalidate: 600) | Category content is relatively stable |
| `/cart` | CSR (client component) | User-specific, no SEO value |
| `/checkout` | CSR | Auth-protected, dynamic |
| `/account/**` | CSR | Auth-protected, user-specific |
| `/orders/[id]` | SSR | Auth check + fresh order status |

### SSR Example (Product Detail)
```tsx
// store_front/app/products/[slug]/page.tsx
import axiosInstance from '@/lib/axios';
import { Product } from '@/types';
import { notFound } from 'next/navigation';

interface Props { params: { slug: string } }

export default async function ProductPage({ params }: Props) {
  let product: Product;
  try {
    const { data } = await axiosInstance.get(`/products/slug/${params.slug}`);
    product = data.data;
  } catch {
    notFound();
  }
  // render...
}

export async function generateMetadata({ params }: Props) {
  try {
    const { data } = await axiosInstance.get(`/products/slug/${params.slug}`);
    const product: Product = data.data;
    return { title: product.name, description: product.description.slice(0, 160) };
  } catch {
    return { title: 'Product Not Found' };
  }
}
```

---

## React Hook Form + Zod (Checkout / Auth Forms)

```tsx
// store_front/components/CheckoutForm.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch } from '@/store';
import { createOrder } from '@/store/slices/orderSlice';

const checkoutSchema = z.object({
  street: z.string().min(3, 'Street required'),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  country: z.string().min(2, 'Country required'),
  zipCode: z.string().regex(/^\d{4,10}$/, 'Invalid zip code'),
  paymentMethod: z.enum(['cod', 'card', 'paypal']),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutForm() {
  const dispatch = useAppDispatch();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (values: CheckoutFormValues) => {
    const { street, city, state, country, zipCode, paymentMethod } = values;
    await dispatch(createOrder({
      items: [], // from cart slice
      shippingAddress: { street, city, state, country, zipCode },
      paymentMethod,
    }));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('street')} placeholder="Street" />
      {errors.street && <p>{errors.street.message}</p>}
      {/* ...other fields... */}
      <button type="submit" disabled={isSubmitting}>Place Order</button>
    </form>
  );
}
```

---

## Swiper — Product Carousel

```tsx
// store_front/components/ProductCarousel.tsx
'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Lazy } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ProductCard from './ProductCard';
import { Product } from '@/types';

interface Props { products: Product[]; title?: string }

export default function ProductCarousel({ products, title }: Props) {
  return (
    <section>
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
      <Swiper
        modules={[Navigation, Pagination, Lazy]}
        spaceBetween={16}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        lazy={{ loadPrevNext: true }}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
      >
        {products.map((product) => (
          <SwiperSlide key={product._id}>
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
```

---

## Optimistic UI — Cart

```ts
// store_front/store/slices/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartState, CartItem, Product } from '@/types';

const initialState: CartState = { items: [], isLoading: false };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: Product; quantity: number }>) => {
      const existing = state.items.find(i => i.product._id === action.payload.product._id);
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(i => i.product._id !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const item = state.items.find(i => i.product._id === action.payload.productId);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(i => i.product._id !== action.payload.productId);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
    },
    clearCart: (state) => { state.items = []; },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
```