"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { fetchProductById } from "@/src/features/products/slices/productsSlice";
import { addItem } from "@/src/features/cart/slices/cartSlice";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Minus, Plus } from "lucide-react";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const {
    selected: product,
    isLoading,
    error,
  } = useAppSelector((state) => state.products);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const [quantity, setQuantity] = useState(1);
  //useParams reads the [id] from the URL.
  //  quantity is local state — no need for Redux since it only lives on this page.
  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
  }, [id, dispatch]);
  //Every time the id in the URL changes, we re-fetch.
  // This handles navigation between product pages.
  const handleAddToCart = () => {
    if (!product) return;
    dispatch(addItem({ product, quantity, isAuthenticated }));
    toast.success(`${product.name} added to cart 🛒`);
  };

  // Quantity controls — can't go below 1 or above stock
  const decreaseQty = () => setQuantity((q) => Math.max(1, q - 1));
  const increaseQty = () =>
    setQuantity((q) => Math.min(product?.stock ?? 1, q + 1));
  // Loading state
  if (isLoading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-10">
          <Skeleton className="h-96 w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-12 w-full mt-6" />
          </div>
        </div>
      </main>
    );
  }

  //The skeleton mirrors the 2-column layout — image on the left, details on the right — so there's no layout shift when the real content loads.
  // Error state
  if (error || !product) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-10 text-center">
        <p className="text-red-500 text-lg">{error || "Product not found"}</p>
        <Button className="mt-4" onClick={() => router.push("/")}>
          Back to Home
        </Button>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-10">
        {/* LEFT — Product image */}
        <div className="relative h-80 md:h-96 rounded-xl overflow-hidden bg-gray-100">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* RIGHT — Product details */}
        <div className="space-y-4">
          {/* Category */}
          <Badge variant="secondary">{product.category}</Badge>

          {/* Name */}
          <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>

          {/* Price */}
          <p className="text-2xl font-bold text-primary">
            ₪{product.price.toFixed(2)}
          </p>

          {/* Description */}
          {product.description && (
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Stock status */}
          {product.stock === 0 ? (
            <Badge variant="destructive" className="text-sm">
              Out of Stock
            </Badge>
          ) : (
            <p className="text-sm text-muted-foreground">
              {product.stock} items left in stock
            </p>
          )}

          {/* Quantity selector */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={decreaseQty}
                  className="p-2 hover:bg-muted transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={increaseQty}
                  className="p-2 hover:bg-muted transition-colors"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Add to cart button */}
          <Button
            size="lg"
            className="w-full mt-2"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart 🛒"}
          </Button>
        </div>
      </div>
    </main>
  );
}
//The quantity selector is clamped between 1 and product.stock — you can never add more than what's available.
//  The + and - buttons are disabled at those boundaries.