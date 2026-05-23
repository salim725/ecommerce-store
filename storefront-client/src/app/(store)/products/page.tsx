// src/app/(store)/products/page.tsx
"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/src/store/hooks";
import { fetchProducts } from "@/src/feature/products/slices/productsSlice";
import ProductsGrid from "@/src/feature/products/components/ProductsGrid";

export default function ProductsPage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>
      <ProductsGrid />
    </main>
  );
}