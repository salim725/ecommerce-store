import ProductsGridSkeleton from "@/src/features/products/components/ProductsGridSkeleton";

export default function ProductsLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <div className="h-9 w-48 bg-muted rounded animate-pulse mb-8" />
      <ProductsGridSkeleton />
    </main>
  );
}
