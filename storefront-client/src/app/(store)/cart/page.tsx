"use client";

import { useAppSelector } from "@/src/store/hooks";
import { selectCartItems } from "@/src/feature/cart/slices/cartSlice";
import CartItem from "@/src/feature/cart/components/CartItem";
import CartSummary from "@/src/feature/cart/components/CartSummary";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function CartPage() {
  const items = useAppSelector(selectCartItems);

  // Empty state
  if (items.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">
          Looks like you haven't added anything yet.
        </p>
        <Button asChild size="lg">
          <Link href="/">Start Shopping</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">Your Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items list — takes 2/3 of the width */}
        <div className="lg:col-span-2">
          {items.map((item) => (
            <CartItem key={item._id} item={item} />
          ))}
        </div>

        {/* Summary — takes 1/3 of the width */}
        <div>
          <CartSummary />
        </div>
      </div>
    </main>
  );
}