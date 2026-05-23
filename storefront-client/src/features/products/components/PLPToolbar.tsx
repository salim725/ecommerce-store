"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FilterSheet from "@/src/features/products/components/FilterSheet";
import {
  SORT_LABELS,
  type SortOption,
} from "@/src/features/products/lib/plpFilters";

interface PLPToolbarProps {
  count: number;
  categories: string[];
}

export default function PLPToolbar({ count, categories }: PLPToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = (searchParams.get("sort") as SortOption) || "featured";

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "featured") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    const query = params.toString();
    router.push(query ? `/products?${query}` : "/products");
  };

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{count}</span>{" "}
        {count === 1 ? "product" : "products"}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <FilterSheet categories={categories} />

        <Select value={sort} onValueChange={handleSortChange}>
          <SelectTrigger size="sm" className="min-w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
              <SelectItem key={key} value={key}>
                {SORT_LABELS[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
