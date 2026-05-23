"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProductDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="max-w-7xl mx-auto px-4 py-10 text-center">
      <h2 className="text-xl font-bold mb-2">Product unavailable</h2>
      <p className="text-muted-foreground mb-6">
        {error.message || "We could not load this product."}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={() => reset()}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/products">Back to products</Link>
        </Button>
      </div>
    </main>
  );
}
