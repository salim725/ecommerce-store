"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/src/store/hooks";
import { selectCartTotal, selectCartCount } from "../slices/cartSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/src/shared/utils/formatPrice";
import { Lock, Truck } from "lucide-react";
import { toast } from "react-toastify";

export default function CartSummary() {
  const router = useRouter();
  const total = useAppSelector(selectCartTotal);
  const count = useAppSelector(selectCartCount);
  const [promoCode, setPromoCode] = useState("");

  const handleApplyPromo = (event: React.FormEvent) => {
    event.preventDefault();
    if (!promoCode.trim()) return;
    toast.info("Promo codes are not available yet");
  };

  return (
    <div className="sticky top-24 space-y-4 rounded-xl border bg-card p-6">
      <h2 className="text-lg font-bold">Order summary</h2>
      <Separator />

      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-primary">
          Have a promo code?
        </summary>
        <form onSubmit={handleApplyPromo} className="mt-3 flex gap-2">
          <Input
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Enter code"
            aria-label="Promo code"
          />
          <Button type="submit" variant="outline" size="sm">
            Apply
          </Button>
        </form>
      </details>

      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Items ({count})</span>
        <span>{formatPrice(total)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Shipping</span>
        <span className="font-medium text-primary">Free</span>
      </div>
      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <Truck className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>Estimated delivery: 3–5 business days</span>
      </div>

      <Separator />

      <div className="flex justify-between text-lg font-bold">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>

      <Button
        className="w-full min-h-11"
        size="lg"
        disabled={count === 0}
        onClick={() => router.push("/checkout")}
      >
        Proceed to checkout
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="size-3.5 shrink-0" aria-hidden />
        Secure SSL checkout
      </p>
    </div>
  );
}
