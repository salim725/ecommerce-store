"use client";

import { Button } from "@/components/ui/button";

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="max-w-7xl mx-auto px-4 py-10 text-center">
      <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-6">
        {error.message || "We could not load the product catalog."}
      </p>
      <Button onClick={() => reset()}>Try again</Button>
    </main>
  );
}
