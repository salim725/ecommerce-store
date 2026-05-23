import { getProductsServer } from "@/src/features/products/lib/getProductsServer";
import { Breadcrumbs } from "@/src/shared/components/Breadcrumbs";
import ProductsListing from "@/src/features/products/components/ProductsListing";

export default async function ProductsPage() {
  const products = await getProductsServer({ limit: 200 });

  const categories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ].sort();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumbs className="mb-6" />
      <ProductsListing products={products} categories={categories} />
    </main>
  );
}
