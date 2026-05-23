"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  buildClearFiltersHref,
  hasActiveFilters,
  parsePLPParams,
} from "@/src/features/products/lib/plpFilters";
import { formatPrice } from "@/src/shared/utils/formatPrice";

export default function ActiveFilterChips() {
  const searchParams = useSearchParams();
  const params = parsePLPParams(searchParams);

  if (!hasActiveFilters(params)) return null;

  const hrefWithout = (...keys: string[]) => {
    const next = new URLSearchParams(searchParams.toString());
    keys.forEach((k) => next.delete(k));
    const q = next.toString();
    return q ? `/products?${q}` : "/products";
  };

  const chips: { label: string; href: string }[] = [];

  if (params.q) {
    chips.push({
      label: `Search: “${params.q}”`,
      href: hrefWithout("q"),
    });
  }

  if (params.category) {
    chips.push({
      label: params.category,
      href: hrefWithout("category"),
    });
  }

  if (params.minPrice != null || params.maxPrice != null) {
    const min =
      params.minPrice != null ? formatPrice(params.minPrice) : "Any";
    const max =
      params.maxPrice != null ? formatPrice(params.maxPrice) : "Any";
    chips.push({
      label: `Price: ${min} – ${max}`,
      href: hrefWithout("minPrice", "maxPrice"),
    });
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Badge key={chip.label} variant="secondary" className="gap-1 pr-1">
          <span className="capitalize">{chip.label}</span>
          <Link
            href={chip.href}
            className="rounded-full p-0.5 hover:bg-muted"
            aria-label={`Remove filter ${chip.label}`}
          >
            <X className="size-3" />
          </Link>
        </Badge>
      ))}
      <Button variant="link" size="sm" className="h-auto px-1" asChild>
        <Link href={buildClearFiltersHref(params)}>Clear all</Link>
      </Button>
    </div>
  );
}
