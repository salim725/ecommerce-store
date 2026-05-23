"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  selectCartItems,
  selectCartTotal,
  clearCart,
} from "@/src/features/cart/slices/cartSlice";
import { createOrder } from "../services/checkoutApi";
import type { ShippingData } from "./ShippingForm";
import type { PaymentData } from "./PaymentForm";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";
import { formatPrice } from "@/src/shared/utils/formatPrice";
import { getErrorMessage } from "@/src/shared/utils/getErrorMessage";

interface Props {
  shippingData: ShippingData;
  paymentData: PaymentData;
  onBack: () => void;
}

function maskCardNumber(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 4) return "••••";
  return `•••• •••• •••• ${digits.slice(-4)}`;
}

export default function OrderReview({
  shippingData,
  paymentData,
  onBack,
}: Props) {
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
      dispatch(clearCart());
      localStorage.removeItem("guest_cart");
      toast.success("Order placed successfully! 🎉");
      router.push(`/orders/${res.data.order._id}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to place order"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Review Your Order</h2>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item._id} className="flex justify-between text-sm">
            <span>
              {item.product.name}{" "}
              <span className="text-muted-foreground">× {item.quantity}</span>
            </span>
            <span className="font-medium">
              {formatPrice(item.product.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <Separator />

      <div>
        <p className="text-sm font-semibold mb-1">Shipping to:</p>
        <p className="text-sm text-muted-foreground">
          {shippingData.fullName}, {shippingData.address},{" "}
          {shippingData.city}, {shippingData.country} {shippingData.postalCode}
        </p>
      </div>

      <Separator />

      <div>
        <p className="text-sm font-semibold mb-1">Payment:</p>
        <p className="text-sm text-muted-foreground">
          Simulated card — {maskCardNumber(paymentData.cardNumber)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {paymentData.cardName} · Expires {paymentData.expiry}
        </p>
      </div>

      <Separator />

      <div className="flex justify-between font-bold text-lg">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>

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
