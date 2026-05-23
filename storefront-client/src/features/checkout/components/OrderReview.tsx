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
import { extractApiData } from "@/src/shared/utils/extractApiData";
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
        shippingData,
        paymentMethod: "card",
        items,
      });
      const order = extractApiData<{ _id: string }>(res.data);
      dispatch(clearCart());
      localStorage.removeItem("guest_cart");
      toast.success("Order placed successfully");
      router.push(`/orders/${order._id}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to place order"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Review your order</h2>

      <p className="text-sm text-muted-foreground">
        {items.length} {items.length === 1 ? "item" : "items"} ·{" "}
        {formatPrice(total)} total
      </p>

      <Separator />

      <div>
        <p className="mb-1 text-sm font-semibold">Shipping to</p>
        <p className="text-sm text-muted-foreground">
          {shippingData.fullName}, {shippingData.address},{" "}
          {shippingData.city}, {shippingData.country} {shippingData.postalCode}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{shippingData.phone}</p>
      </div>

      <Separator />

      <div>
        <p className="mb-1 text-sm font-semibold">Payment</p>
        <p className="text-sm text-muted-foreground">
          Simulated card — {maskCardNumber(paymentData.cardNumber)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {paymentData.cardName} · Expires {paymentData.expiry}
        </p>
      </div>

      <Separator />

      <OrderTotalRow total={total} />

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 min-h-11" onClick={onBack}>
          Back
        </Button>
        <Button
          className="flex-1 min-h-11"
          size="lg"
          onClick={handlePlaceOrder}
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? "Placing order…" : "Place order"}
        </Button>
      </div>
    </div>
  );
}

function OrderTotalRow({ total }: { total: number }) {
  return (
    <div className="flex justify-between text-lg font-bold">
      <span>Total</span>
      <span>{formatPrice(total)}</span>
    </div>
  );
}
