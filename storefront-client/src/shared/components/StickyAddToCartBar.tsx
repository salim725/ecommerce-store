"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/src/shared/utils/formatPrice";
import { cn } from "@/lib/utils";

export interface StickyAddToCartBarProps {
  productName: string;
  price: number;
  onAddToCart: () => void;
  disabled?: boolean;
  isAdding?: boolean;
  className?: string;
}

export function StickyAddToCartBar({
  productName,
  price,
  onAddToCart,
  disabled = false,
  isAdding = false,
  className,
}: StickyAddToCartBarProps) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-md md:hidden",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3",
        className,
      )}
      role="region"
      aria-label="Add to cart"
    >
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{productName}</p>
          <p className="text-lg font-bold text-primary">
            {formatPrice(price)}
          </p>
        </div>
        <Button
          size="lg"
          className="shrink-0 min-h-11 px-6"
          onClick={onAddToCart}
          disabled={disabled || isAdding}
          aria-busy={isAdding}
        >
          {disabled ? "Out of stock" : isAdding ? "Adding…" : "Add to cart"}
        </Button>
      </div>
    </div>
  );
}
