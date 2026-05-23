"use client";

import { useAppSelector } from "@/src/store/hooks";
import { selectCartItems, selectCartCount } from "@/src/features/cart/slices/cartSlice";
import CartItem from "@/src/features/cart/components/CartItem";
import CartSummary from "@/src/features/cart/components/CartSummary";
import CartCrossSell from "@/src/features/cart/components/CartCrossSell";
import CartEmptyState from "@/src/features/cart/components/CartEmptyState";
import type { Product } from "@/src/features/products/lib/getProductsServer";

interface CartPageContentProps {
  crossSellProducts: Product[];
  categories: string[];
  featuredProduct?: Product;
}

export default function CartPageContent({
  crossSellProducts,
  categories,
  featuredProduct,
}: CartPageContentProps) {
  const items = useAppSelector(selectCartItems);
  const count = useAppSelector(selectCartCount);

  if (items.length === 0) {
    return (
      <CartEmptyState
        categories={categories}
        featuredProduct={featuredProduct}
      />
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-bold">
        Your cart ({count} {count === 1 ? "item" : "items"})
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {items.map((item) => (
            <CartItem key={item._id} item={item} />
          ))}
          <CartCrossSell products={crossSellProducts} />
        </div>

        <div>
          <CartSummary />
        </div>
      </div>
    </main>
  );
}
