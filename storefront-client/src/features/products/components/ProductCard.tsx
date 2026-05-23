"use client";

import { useState } from "react";
import ProductImage from "@/src/shared/components/ProductImage";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { addItem } from "@/src/features/cart/slices/cartSlice";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/src/shared/components/StarRating";
import { formatPrice } from "@/src/shared/utils/formatPrice";
import { cn } from "@/lib/utils";

import type { Product } from "@/src/features/products/lib/getProductsServer";

export default function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [isAdding, setIsAdding] = useState(false);

  const outOfStock = product.stock === 0;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock || isAdding) return;

    setIsAdding(true);
    try {
      await dispatch(
        addItem({ product, quantity: 1, isAuthenticated }),
      ).unwrap();
      toast.success("Added to cart");
    } catch {
      toast.error("Could not add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card",
        "transition-shadow hover:shadow-md",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
      )}
    >
      <div className="relative aspect-[4/3] w-full bg-muted">
        <Link
          href={`/products/${product._id}`}
          className="absolute inset-0 block"
          tabIndex={-1}
          aria-hidden={outOfStock}
        >
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </Link>

        {outOfStock ? (
          <Badge
            variant="secondary"
            className="absolute left-2 top-2 bg-background/90"
          >
            Out of stock
          </Badge>
        ) : (
          <div className="pointer-events-none absolute inset-0 hidden bg-black/0 transition-colors group-hover:bg-black/10 md:block" />
        )}

        {!outOfStock && (
          <Button
            type="button"
            size="icon"
            className={cn(
              "absolute bottom-2 right-2 size-10 rounded-full shadow-md",
              "opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
              "pointer-events-auto md:opacity-0",
            )}
            onClick={handleQuickAdd}
            disabled={isAdding}
            aria-label={`Quick add ${product.name} to cart`}
          >
            <Plus className="size-5" aria-hidden />
          </Button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Badge variant="secondary" className="w-fit text-xs capitalize">
          {product.category}
        </Badge>

        <Link
          href={`/products/${product._id}`}
          className="font-semibold text-sm leading-snug line-clamp-2 hover:underline"
        >
          {product.name}
        </Link>

        <StarRating
          className="scale-90 origin-left"
          reviewsHref={`/products/${product._id}#reviews`}
        />

        <p className="mt-auto text-base font-bold text-primary">
          {formatPrice(product.price)}
        </p>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2 w-full md:hidden"
          onClick={handleQuickAdd}
          disabled={outOfStock || isAdding}
        >
          {outOfStock
            ? "Out of stock"
            : isAdding
              ? "Adding…"
              : "Add to cart"}
        </Button>
      </div>
    </article>
  );
}
