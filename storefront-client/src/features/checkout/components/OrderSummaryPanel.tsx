"use client";

import ProductImage from "@/src/shared/components/ProductImage";
import Link from "next/link";
import { useAppSelector } from "@/src/store/hooks";
import {
  selectCartItems,
  selectCartCount,
  selectCartTotal,
} from "@/src/features/cart/slices/cartSlice";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/src/shared/utils/formatPrice";
import { Truck, Lock } from "lucide-react";

interface OrderSummaryPanelProps {
  className?: string;
}

export default function OrderSummaryPanel({ className }: OrderSummaryPanelProps) {
  const items = useAppSelector(selectCartItems);
  const count = useAppSelector(selectCartCount);
  const total = useAppSelector(selectCartTotal);

  if (items.length === 0) {
    return (
      <aside
        className={className}
        aria-label="Order summary"
      >
        <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
          Your cart is empty.{" "}
          <Link href="/products" className="font-medium text-primary underline-offset-4 hover:underline">
            Continue shopping
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <aside className={className} aria-label="Order summary">
      <div className="space-y-4 rounded-xl border bg-card p-6 lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold">
          Order summary
          <span className="font-normal text-muted-foreground">
            {" "}
            ({count} {count === 1 ? "item" : "items"})
          </span>
        </h2>

        <ul className="max-h-64 space-y-3 overflow-y-auto pr-1">
          {items.map((item) => (
            <li key={item._id} className="flex gap-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                <ProductImage
                  src={item.product.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.product.name}</p>
                <p className="text-xs text-muted-foreground">
                  Qty {item.quantity} · {formatPrice(item.product.price)} each
                </p>
              </div>
              <p className="shrink-0 text-sm font-medium">
                {formatPrice(item.product.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-primary font-medium">Free</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between text-base font-bold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>

        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Truck className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>Estimated delivery: 3–5 business days</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="size-3.5 shrink-0" aria-hidden />
          <span>Secure SSL checkout</span>
        </div>
      </div>
    </aside>
  );
}
