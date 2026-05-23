"use client";

import ProductImage from "@/src/shared/components/ProductImage";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/src/features/products/lib/getProductsServer";
import { formatPrice } from "@/src/shared/utils/formatPrice";

interface CartEmptyStateProps {
  categories: string[];
  featuredProduct?: Product;
}

export default function CartEmptyState({
  categories,
  featuredProduct,
}: CartEmptyStateProps) {
  const categoryLinks = categories.slice(0, 3);

  return (
    <main className="mx-auto max-w-4xl px-4 py-16 text-center">
      <ShoppingCart
        className="mx-auto mb-4 size-16 text-muted-foreground"
        aria-hidden
      />
      <h1 className="mb-2 text-2xl font-bold">Your cart is empty</h1>
      <p className="mb-8 text-muted-foreground">
        Looks like you have not added anything yet.
      </p>

      {categoryLinks.length > 0 && (
        <nav
          className="mb-10 flex flex-wrap justify-center gap-3"
          aria-label="Shop by category"
        >
          {categoryLinks.map((category) => (
            <Button key={category} variant="outline" size="sm" asChild>
              <Link href={`/products?category=${encodeURIComponent(category)}`}>
                Shop {category}
              </Link>
            </Button>
          ))}
        </nav>
      )}

      {featuredProduct && (
        <div className="mx-auto max-w-xs rounded-xl border bg-card p-4 text-left">
          <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
            You might like
          </p>
          <Link
            href={`/products/${featuredProduct._id}`}
            className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
              <ProductImage
                src={featuredProduct.imageUrl}
                alt={featuredProduct.name}
                fill
                className="object-cover transition-transform group-hover:scale-[1.02]"
                sizes="320px"
              />
            </div>
            <p className="mt-3 font-medium">{featuredProduct.name}</p>
            <p className="text-sm font-semibold text-primary">
              {formatPrice(featuredProduct.price)}
            </p>
          </Link>
        </div>
      )}

      <Button asChild size="lg" className="mt-8">
        <Link href="/products">Start shopping</Link>
      </Button>
    </main>
  );
}
