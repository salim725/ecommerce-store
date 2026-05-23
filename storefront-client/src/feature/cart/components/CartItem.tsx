"use client";

import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { updateItem, removeItem } from "../slices/cartSlice";
import type { CartItem as CartItemType } from "../slices/cartSlice";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

export default function CartItem({ item }: { item: CartItemType }) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const handleUpdate = (quantity: number) => {
    dispatch(updateItem({ itemId: item._id, quantity, isAuthenticated }));
  };

  const handleRemove = () => {
    dispatch(removeItem({ itemId: item._id, isAuthenticated }));
    toast.info(`${item.product.name} removed from cart`);
  };

  return (
    <div className="flex gap-4 py-4 border-b items-center">
      {/* Product image */}
      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        <Image
          src={item.product.imageUrl}
          alt={item.product.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Name + price */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.product.name}</p>
        <p className="text-sm text-muted-foreground">
          ₪{item.product.price.toFixed(2)} each
        </p>
        <p className="font-semibold mt-1">
          ₪{(item.product.price * item.quantity).toFixed(2)}
        </p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center border rounded-lg">
        <button
          onClick={() => handleUpdate(item.quantity - 1)}
          disabled={item.quantity <= 1}
          className="p-2 hover:bg-muted transition-colors disabled:opacity-40"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="px-3 text-sm font-medium">{item.quantity}</span>
        <button
          onClick={() => handleUpdate(item.quantity + 1)}
          className="p-2 hover:bg-muted transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Remove button */}
      <Button variant="ghost" size="icon" onClick={handleRemove}>
        <Trash2 className="w-4 h-4 text-red-500" />
      </Button>
    </div>
  );
}