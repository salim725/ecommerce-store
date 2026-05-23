"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  return (
    <main className="max-w-lg mx-auto px-4 py-20 text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">Order Placed!</h1>
      <p className="text-muted-foreground mb-2">
        Thank you for your purchase 🎉
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        Order ID: <span className="font-mono font-medium">{id}</span>
      </p>

      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={() => router.push("/orders")}>
          View My Orders
        </Button>
        <Button onClick={() => router.push("/")}>
          Continue Shopping
        </Button>
      </div>
    </main>
  );
}