export interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  category: string;
  description?: string;
}

type GetProductsParams = {
  category?: string;
  page?: number;
  limit?: number;
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

export async function fetchProductsJson<T>(path: string): Promise<T> {
  const res = await fetch(`${getApiUrl()}${path}`, {
    next: { revalidate: 60 },
    headers: getServerFetchHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }
  return res.json();
}

export async function getProductsServer(
  params?: GetProductsParams,
): Promise<Product[]> {
  const search = new URLSearchParams();
  if (params?.category) search.set("category", params.category);
  if (params?.page != null) search.set("page", String(params.page));
  if (params?.limit != null) search.set("limit", String(params.limit));
  const query = search.toString();
  return fetchProductsJson<Product[]>(
    `/products${query ? `?${query}` : ""}`,
  );
}

export async function getFeaturedServer(): Promise<Product[]> {
  return fetchProductsJson<Product[]>("/products/featured");
}
