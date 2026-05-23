"use client";

import ProductImage from "@/src/shared/components/ProductImage";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { addItem } from "@/src/features/cart/slices/cartSlice";
import type { Product } from "@/src/features/products/lib/getProductsServer";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/src/shared/utils/formatPrice";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/src/shared/utils/getErrorMessage";

interface CartCrossSellProps {
  products: Product[];
}

export default function CartCrossSell({ products }: CartCrossSellProps) {
  const dispatch = useAppDispatch();
  const cartProductIds = useAppSelector((s) =>
    s.cart.items.map((i) => i.product._id),
  );
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const suggestions = products
    .filter((p) => !cartProductIds.includes(p._id) && p.stock > 0)
    .slice(0, 3);

  if (suggestions.length === 0) return null;

  const handleQuickAdd = async (product: Product) => {
    try {
      await dispatch(
        addItem({
          product: {
            _id: product._id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
          },
          quantity: 1,
          isAuthenticated,
        }),
      ).unwrap();
      toast.success("Added to cart");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Could not add to cart"));
    }
  };

  return (
    <section className="mt-10 border-t pt-8" aria-labelledby="cross-sell-heading">
      <h2 id="cross-sell-heading" className="mb-4 text-lg font-semibold">
        Complete your look
      </h2>
      <ul className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory">
        {suggestions.map((product) => (
          <li
            key={product._id}
            className="w-44 shrink-0 snap-start rounded-xl border bg-card p-3"
          >
            <Link
              href={`/products/${product._id}`}
              className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                <ProductImage
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="176px"
                />
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-medium">{product.name}</p>
              <p className="mt-1 text-sm font-semibold text-primary">
                {formatPrice(product.price)}
              </p>
            </Link>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 w-full min-h-9"
              onClick={() => void handleQuickAdd(product)}
            >
              Add to cart
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
