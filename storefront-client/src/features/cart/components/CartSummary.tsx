"use client";

import { useRouter } from "next/navigation";
import { useAppSelector } from "@/src/store/hooks";
import { selectCartTotal, selectCartCount } from "../slices/cartSlice";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/src/shared/utils/formatPrice";

export default function CartSummary() {
  const router = useRouter();
  const total = useAppSelector(selectCartTotal);
  const count = useAppSelector(selectCartCount);

  return (
    <div className="border rounded-xl p-6 space-y-4 sticky top-24">
      <h2 className="text-lg font-bold">Order Summary</h2>
      <Separator />

      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Items ({count})</span>
        <span>{formatPrice(total)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Shipping</span>
        <span className="text-green-600">Free</span>
      </div>

      <Separator />

      <div className="flex justify-between font-bold text-lg">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>

      <Button
        className="w-full"
        size="lg"
        disabled={count === 0}
        onClick={() => router.push("/checkout")}
      >
        Proceed to Checkout
      </Button>
    </div>
  );
}