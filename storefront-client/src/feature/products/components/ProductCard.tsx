"use client";

import Image from "next/image";
import Link from "next/link";
import { useAppDispatch } from "@/src/store/hooks";
import { addToCart } from "@/src/feature/cart/slices/cartSlice";
import { toast } from "react-toastify";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  category: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success(`${product.name} added to cart 🛒`);
  };
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product image */}
      <Link href={`/products/${product._id}`}>
        <div className="relative h-52 w-full bg-gray-100">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>

      <CardContent className="p-4 space-y-1">
        {/* Category badge */}
        <Badge variant="secondary" className="text-xs">
          {product.category}
        </Badge>

        {/* Name */}
        <Link href={`/products/${product._id}`}>
          <h3 className="font-semibold text-sm hover:underline line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <p className="text-lg font-bold">₪{product.price.toFixed(2)}</p>

        {/* Stock status */}
        {product.stock === 0 && (
          <Badge variant="destructive">Out of Stock</Badge>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
  //line-clamp-2 truncates long product names to 2 lines so all cards stay the same height.
  //  fill on the Image means it fills its container — we control size with the parent div
}
//We dispatch addToCart directly from the card — no navigation needed. The cart slice (Step 6) will handle the logic.