"use client";

import { useAppSelector } from "@/src/store/hooks";
import ProductCard from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton card shown while products are loading
function ProductCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden border">
      <Skeleton className="h-52 w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-full mt-2" />
      </div>
    </div>
  );
}
export default function ProductsGrid() {
    const { items, isLoading, error } = useAppSelector((state) => state.products);
  
    if (error) {
      return <p className="text-center text-red-500 py-10">{error}</p>;
    }
  
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading
          ? // Show 8 skeleton cards while loading
            Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : items.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
        }
      </div>
    );
  }