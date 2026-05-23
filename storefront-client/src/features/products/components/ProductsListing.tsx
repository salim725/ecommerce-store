"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductsGrid from "@/src/features/products/components/ProductsGrid";
import PLPToolbar from "@/src/features/products/components/PLPToolbar";
import ActiveFilterChips from "@/src/features/products/components/ActiveFilterChips";
import { FilterPanel } from "@/src/features/products/components/FilterPanel";
import { Button } from "@/components/ui/button";
import type { Product } from "@/src/features/products/lib/getProductsServer";
import {
  filterProducts,
  parsePLPParams,
  sortProducts,
} from "@/src/features/products/lib/plpFilters";

interface ProductsListingProps {
  products: Product[];
  categories: string[];
}

function ProductsListingInner({
  products,
  categories,
}: ProductsListingProps) {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const filtered = useMemo(() => {
    const params = parsePLPParams(
      new URLSearchParams(queryString),
    );
    const filteredList = filterProducts(products, params);
    return sortProducts(filteredList, params.sort ?? "featured");
  }, [products, queryString]);

  const params = parsePLPParams(searchParams);

  const pageTitle = params.category ?? "All Products";

  return (
    <>
      <div className="mb-8">
        <h1
          className="font-bold tracking-tight capitalize"
          style={{
            fontSize: "var(--text-lg)",
            lineHeight: "var(--text-lg--line-height)",
          }}
        >
          {params.q ? `Results for “${params.q}”` : pageTitle}
        </h1>
        {params.category && !params.q && (
          <p className="mt-2 text-muted-foreground">
            Showing products in{" "}
            <span className="font-medium text-foreground">{params.category}</span>
          </p>
        )}
      </div>

      <div className="flex gap-8 lg:gap-10">
        <aside className="hidden w-[280px] shrink-0 lg:block">
          <p className="mb-4 text-sm font-semibold">Filters</p>
          <FilterPanel categories={categories} />
        </aside>

        <div className="min-w-0 flex-1">
          <PLPToolbar count={filtered.length} categories={categories} />
          <ActiveFilterChips />

          {filtered.length > 0 ? (
            <ProductsGrid products={filtered} />
          ) : (
            <div className="rounded-xl border border-dashed bg-muted/30 px-6 py-16 text-center">
              <p className="text-lg font-medium">No products match your filters</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting search or filters to see more items.
              </p>
              <Button className="mt-6" variant="outline" asChild>
                <Link href="/products">Clear filters</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function ProductsListing(props: ProductsListingProps) {
  return (
    <Suspense
      fallback={
        <p className="py-10 text-center text-muted-foreground">Loading…</p>
      }
    >
      <ProductsListingInner {...props} />
    </Suspense>
  );
}
