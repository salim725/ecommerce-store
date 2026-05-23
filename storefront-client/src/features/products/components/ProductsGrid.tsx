import ProductCard from "./ProductCard";
import type { Product } from "@/src/features/products/lib/getProductsServer";

interface ProductsGridProps {
  products: Product[];
}

export default function ProductsGrid({ products }: ProductsGridProps) {
  if (!products.length) {
    return (
      <p className="text-center text-muted-foreground py-10">
        No products found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
