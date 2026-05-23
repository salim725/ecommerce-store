import { mapCartResponse } from "@/src/features/cart/lib/mapCart";
import {
  mapProductFromApi,
  mapProductsFromApi,
} from "@/src/features/products/lib/mapProduct";
import { mapUserFromApi } from "@/src/shared/utils/mapUserFromApi";

function pathOnly(url: string): string {
  return url.split("?")[0] ?? url;
}

/**
 * Maps unwrapped backend payloads to storefront domain shapes (after envelope unwrap).
 */
export function normalizeApiResponse(
  url: string,
  unwrapped: unknown,
): unknown {
  const path = pathOnly(url);

  if (path === "/auth/me") {
    return { user: mapUserFromApi(unwrapped as Parameters<typeof mapUserFromApi>[0]) };
  }

  if (path === "/auth/login") {
    const payload = unwrapped as { token: string; user: Parameters<typeof mapUserFromApi>[0] };
    return {
      token: payload.token,
      user: mapUserFromApi(payload.user),
    };
  }

  if (path.startsWith("/cart")) {
    return mapCartResponse(unwrapped);
  }

  if (path === "/products" && Array.isArray(unwrapped)) {
    return mapProductsFromApi(unwrapped as Parameters<typeof mapProductsFromApi>[0]);
  }

  if (path.startsWith("/products/") && unwrapped && typeof unwrapped === "object") {
    return mapProductFromApi(unwrapped as Parameters<typeof mapProductFromApi>[0]);
  }

  return unwrapped;
}
