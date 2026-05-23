"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  categories: string[];
  className?: string;
  onApplied?: () => void;
}

function FilterPanelForm({
  categories,
  className,
  onApplied,
  initialCategory,
  initialMinPrice,
  initialMaxPrice,
}: FilterPanelProps & {
  initialCategory: string;
  initialMinPrice: string;
  initialMaxPrice: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedCategory) {
      params.set("category", selectedCategory);
    } else {
      params.delete("category");
    }

    if (minPrice.trim()) {
      params.set("minPrice", minPrice.trim());
    } else {
      params.delete("minPrice");
    }

    if (maxPrice.trim()) {
      params.set("maxPrice", maxPrice.trim());
    } else {
      params.delete("maxPrice");
    }

    const query = params.toString();
    router.push(query ? `/products?${query}` : "/products");
    onApplied?.();
  }, [
    router,
    searchParams,
    selectedCategory,
    minPrice,
    maxPrice,
    onApplied,
  ]);

  return (
    <div className={cn("space-y-6", className)}>
      {categories.length > 0 && (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">Category</legend>
          <ul className="space-y-2">
            <li>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="category-filter"
                  checked={!selectedCategory}
                  onChange={() => setSelectedCategory("")}
                  className="size-4 accent-primary"
                />
                All categories
              </label>
            </li>
            {categories.map((cat) => (
              <li key={cat}>
                <label className="flex cursor-pointer items-center gap-2 text-sm capitalize">
                  <input
                    type="radio"
                    name="category-filter"
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)}
                    className="size-4 accent-primary"
                  />
                  {cat}
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      <div className="space-y-3">
        <p className="text-sm font-semibold">Price range</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="min-price" className="sr-only">
              Minimum price
            </Label>
            <Input
              id="min-price"
              type="number"
              min={0}
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="max-price" className="sr-only">
              Maximum price
            </Label>
            <Input
              id="max-price"
              type="number"
              min={0}
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Button type="button" className="w-full" onClick={applyFilters}>
        Apply filters
      </Button>
    </div>
  );
}

export function FilterPanel(props: FilterPanelProps) {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const syncKey = `${category}|${minPrice}|${maxPrice}`;

  return (
    <FilterPanelForm
      key={syncKey}
      {...props}
      initialCategory={category}
      initialMinPrice={minPrice}
      initialMaxPrice={maxPrice}
    />
  );
}
