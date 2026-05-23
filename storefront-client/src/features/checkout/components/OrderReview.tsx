"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { selectCartItems, selectCartTotal, clearCart } from "@/src/features/cart/slices/cartSlice";
import { createOrder } from "../services/checkoutApi";
import type { ShippingData } from "./ShippingForm";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";

interface Props {
  shippingData: ShippingData;
  onBack: () => void;
}

export default function OrderReview({ shippingData, onBack }: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);
  const [isLoading, setIsLoading] = useState(false);
  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      const res = await createOrder({
        shippingAddress: shippingData,
        paymentMethod: "card",
        items,
      });
      dispatch(clearCart());                        // empty the cart in Redux
      localStorage.removeItem("guest_cart");        // clear guest cart too
      toast.success("Order placed successfully! 🎉");
      router.push(`/orders/${res.data.order._id}`); // go to confirmation page
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };
  //This is where the actual API call happens — 
  // only when the user clicks "Place Order" on the review screen,
  //  after seeing everything.
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Review Your Order</h2>

      {/* Cart items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item._id} className="flex justify-between text-sm">
            <span>
              {item.product.name}{" "}
              <span className="text-muted-foreground">× {item.quantity}</span>
            </span>
            <span className="font-medium">
              ₪{(item.product.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <Separator />

      {/* Shipping address summary */}
      <div>
        <p className="text-sm font-semibold mb-1">Shipping to:</p>
        <p className="text-sm text-muted-foreground">
          {shippingData.fullName}, {shippingData.address},{" "}
          {shippingData.city}, {shippingData.country} {shippingData.postalCode}
        </p>
      </div>

      <Separator />

      {/* Total */}
      <div className="flex justify-between font-bold text-lg">
        <span>Total</span>
        <span>₪{total.toFixed(2)}</span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onBack}>
          ← Back
        </Button>
        <Button
          className="flex-1"
          size="lg"
          onClick={handlePlaceOrder}
          disabled={isLoading}
        >
          {isLoading ? "Placing Order..." : "Place Order ✓"}
        </Button>
      </div>
    </div>
  );
}