import Link from "next/link";
import ProductsGrid from "@/src/features/products/components/ProductsGrid";
import { getProductsServer } from "@/src/features/products/lib/getProductsServer";
import { Button } from "@/components/ui/button";

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category } = await searchParams;
  const products = await getProductsServer(
    category ? { category } : undefined,
  );

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {category ? category : "All Products"}
        </h1>
        {category && (
          <p className="mt-2 text-muted-foreground">
            Showing products in{" "}
            <span className="font-medium text-foreground">{category}</span>
          </p>
        )}
        {category && (
          <Button variant="link" className="mt-2 h-auto p-0" asChild>
            <Link href="/products">Clear filter</Link>
          </Button>
        )}
      </div>
      <ProductsGrid products={products} />
    </main>
  );
}
