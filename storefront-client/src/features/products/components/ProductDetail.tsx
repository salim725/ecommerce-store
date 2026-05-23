"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { addItem } from "@/src/features/cart/slices/cartSlice";
import type { Product } from "@/src/features/products/lib/getProductsServer";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatPrice } from "@/src/shared/utils/formatPrice";
import { Breadcrumbs } from "@/src/shared/components/Breadcrumbs";
import { StarRating } from "@/src/shared/components/StarRating";
import { ProductTrustRow } from "@/src/shared/components/ProductTrustRow";
import { QuantityStepper } from "@/src/shared/components/QuantityStepper";
import ProductGallery from "@/src/features/products/components/ProductGallery";
import ProductReviews from "@/src/features/products/components/ProductReviews";
import { StickyAddToCartBar } from "@/src/shared/components/StickyAddToCartBar";

function getValueProps(description?: string): string[] {
  if (description) {
    const firstSentence = description.split(/[.!?]/)[0]?.trim();
    if (firstSentence && firstSentence.length > 10) {
      return [firstSentence];
    }
  }
  return [
    "Thoughtfully curated for everyday wear",
    "Quality materials, designed to last",
    "Free shipping on orders over $50",
  ];
}

export default function ProductDetail({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const valueProps = getValueProps(product.description);
  const inStock = product.stock > 0;

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await dispatch(
        addItem({ product, quantity, isAuthenticated }),
      ).unwrap();
      toast.success("Added to cart");
    } catch {
      toast.error("Could not add to cart. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      /* user cancelled share */
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 pb-28 md:pb-10">
      <div className="grid gap-10 lg:grid-cols-[3fr_2fr] lg:gap-12">
        <ProductGallery
          name={product.name}
          imageUrl={product.imageUrl}
          images={product.images}
        />

        <div className="space-y-5">
          <Breadcrumbs
            category={product.category}
            productName={product.name}
          />

          <Badge variant="secondary" className="capitalize">
            {product.category}
          </Badge>

          <h1
            className="font-semibold tracking-tight"
            style={{
              fontSize: "var(--text-xl)",
              lineHeight: "var(--text-xl--line-height)",
            }}
          >
            {product.name}
          </h1>

          <StarRating />

          <div className="space-y-1">
            <p className="text-2xl font-bold text-primary">
              {formatPrice(product.price)}
            </p>
            {inStock ? (
              <p className="text-sm text-muted-foreground">
                {product.stock} in stock
              </p>
            ) : (
              <Badge variant="destructive">Out of stock</Badge>
            )}
          </div>

          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            {valueProps.map((prop) => (
              <li key={prop}>{prop}</li>
            ))}
          </ul>

          {inStock && (
            <>
              <QuantityStepper
                value={quantity}
                max={product.stock}
                onChange={setQuantity}
              />

              <Button
                size="lg"
                className="w-full min-h-11"
                onClick={handleAddToCart}
                disabled={isAdding}
                aria-busy={isAdding}
              >
                {isAdding ? "Adding…" : "Add to cart"}
              </Button>
            </>
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11"
              onClick={handleShare}
            >
              <Share2 className="mr-2 size-4" aria-hidden />
              Share
            </Button>
          </div>

          <ProductTrustRow />
        </div>
      </div>

      <div className="mt-12 space-y-10 border-t border-border pt-10">
        <Accordion type="single" collapsible defaultValue="description">
          <AccordionItem value="description">
            <AccordionTrigger>Description</AccordionTrigger>
            <AccordionContent>
              {product.description ? (
                <p className="leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              ) : (
                <p className="text-muted-foreground">
                  No description available for this product.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <ProductReviews />
      </div>

      {inStock && (
        <StickyAddToCartBar
          productName={product.name}
          price={product.price}
          onAddToCart={handleAddToCart}
          isAdding={isAdding}
        />
      )}
    </main>
  );
}
