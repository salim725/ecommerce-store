import type { Product } from "@/src/features/products/lib/getProductsServer";

export type SortOption =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc";

export const SORT_LABELS: Record<SortOption, string> = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "name-asc": "Name: A–Z",
  "name-desc": "Name: Z–A",
};

export interface PLPFilterParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
}

export function parsePLPParams(searchParams: URLSearchParams): PLPFilterParams {
  const sort = searchParams.get("sort") as SortOption | null;
  const minRaw = searchParams.get("minPrice");
  const maxRaw = searchParams.get("maxPrice");

  return {
    q: searchParams.get("q") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    sort:
      sort && sort in SORT_LABELS ? sort : undefined,
    minPrice: minRaw ? Number(minRaw) : undefined,
    maxPrice: maxRaw ? Number(maxRaw) : undefined,
  };
}

export function filterProducts(
  products: Product[],
  { q, category, minPrice, maxPrice }: Omit<PLPFilterParams, "sort">,
): Product[] {
  let result = products;

  if (category) {
    result = result.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase(),
    );
  }

  if (q?.trim()) {
    const term = q.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        (p.description?.toLowerCase().includes(term) ?? false),
    );
  }

  if (minPrice != null && !Number.isNaN(minPrice)) {
    result = result.filter((p) => p.price >= minPrice);
  }

  if (maxPrice != null && !Number.isNaN(maxPrice)) {
    result = result.filter((p) => p.price <= maxPrice);
  }

  return result;
}

export function sortProducts(
  products: Product[],
  sort: SortOption = "featured",
): Product[] {
  const copy = [...products];

  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "name-asc":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return copy.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return copy;
  }
}

export function hasActiveFilters(params: PLPFilterParams): boolean {
  return Boolean(
    params.q ||
      params.category ||
      params.minPrice != null ||
      params.maxPrice != null,
  );
}

export function buildClearFiltersHref(
  params: PLPFilterParams,
  preserveSort = true,
): string {
  const next = new URLSearchParams();
  if (preserveSort && params.sort) {
    next.set("sort", params.sort);
  }
  const q = next.toString();
  return q ? `/products?${q}` : "/products";
}
