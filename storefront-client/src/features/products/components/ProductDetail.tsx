"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { addItem } from "@/src/features/cart/slices/cartSlice";
import type { Product } from "@/src/features/products/lib/getProductsServer";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { formatPrice } from "@/src/shared/utils/formatPrice";

export default function ProductDetail({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    dispatch(addItem({ product, quantity, isAuthenticated }));
    toast.success(`${product.name} added to cart 🛒`);
  };

  const decreaseQty = () => setQuantity((q) => Math.max(1, q - 1));
  const increaseQty = () =>
    setQuantity((q) => Math.min(product.stock, q + 1));

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="relative h-80 md:h-96 rounded-xl overflow-hidden bg-gray-100">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="space-y-4">
          <Badge variant="secondary">{product.category}</Badge>

          <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>

          <p className="text-2xl font-bold text-primary">
            {formatPrice(product.price)}
          </p>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          )}

          {product.stock === 0 ? (
            <Badge variant="destructive" className="text-sm">
              Out of Stock
            </Badge>
          ) : (
            <p className="text-sm text-muted-foreground">
              {product.stock} items left in stock
            </p>
          )}

          {product.stock > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  type="button"
                  onClick={decreaseQty}
                  className="p-2 hover:bg-muted transition-colors"
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={increaseQty}
                  className="p-2 hover:bg-muted transition-colors"
                  disabled={quantity >= product.stock}
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

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
