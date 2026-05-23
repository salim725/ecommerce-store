"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/src/store/hooks";
import { fetchProducts, fetchFeatured } from "@/src/feature/products/slices/productsSlice";
import HeroCarousel from "@/src/feature/products/components/HeroCarousal";
import ProductsGrid from "@/src/feature/products/components/ProductsGrid";

export default function HomePage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchFeatured()); // load hero carousel data
    dispatch(fetchProducts()); // load main products grid
  }, [dispatch]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Hero carousel */}
      <HeroCarousel />

      {/* Products section */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Our Products</h2>
        <ProductsGrid />
      </section>
    </main>
  );
}