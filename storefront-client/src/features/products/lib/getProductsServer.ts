import {
  isBackendEnvelope,
  unwrapApi,
} from "@/src/shared/utils/unwrapApi";
import { mapProductFromApi, mapProductsFromApi } from "./mapProduct";

export interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  images?: string[];
  stock: number;
  category: string;
  description?: string;
}

type GetProductsParams = {
  category?: string;
  page?: number;
  limit?: number;
  sort?: string;
};

function getApiUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  return base.replace(/\/$/, "");
}

function getServerFetchHeaders(): HeadersInit {
  const headers: HeadersInit = {};
  const token = process.env.API_INTERNAL_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function fetchApiRaw(path: string): Promise<unknown> {
  try {
    const res = await fetch(`${getApiUrl()}${path}`, {
      next: { revalidate: 60 },
      headers: getServerFetchHeaders(),
    });
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch {
    return null;
  }
}

function unwrapFetchBody(body: unknown): unknown {
  if (isBackendEnvelope(body)) {
    return unwrapApi(body);
  }
  return body;
}

export async function getProductsServer(
  params?: GetProductsParams,
): Promise<Product[]> {
  const search = new URLSearchParams();
  if (params?.category) search.set("category", params.category);
  if (params?.page != null) search.set("page", String(params.page));
  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.sort) search.set("sort", params.sort);
  const query = search.toString();
  const body = await fetchApiRaw(`/products${query ? `?${query}` : ""}`);
  if (body == null) return [];
  const data = unwrapFetchBody(body);
  return mapProductsFromApi(
    (Array.isArray(data) ? data : []) as Parameters<
      typeof mapProductsFromApi
    >[0],
  );
}

/** Newest products for hero / empty cart (no dedicated /products/featured route). */
export async function getFeaturedServer(): Promise<Product[]> {
  return getProductsServer({ sort: "-createdAt", limit: 8 });
}

export async function fetchProductByIdServer(
  id: string,
): Promise<Product | null> {
  try {
    const body = await fetchApiRaw(`/products/${id}`);
    const data = unwrapFetchBody(body);
    if (!data || typeof data !== "object") return null;
    return mapProductFromApi(
      data as Parameters<typeof mapProductFromApi>[0],
    );
  } catch {
    return null;
  }
}
