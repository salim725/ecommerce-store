import type { CartItem } from "../slices/cartSlice";

type ApiCartProduct = {
  _id?: string;
  id?: string;
  name?: string;
  price?: number;
  images?: string[];
  imageUrl?: string;
};

type CartSummaryItem = {
  product: ApiCartProduct | string;
  quantity: number;
};

type CartSummary = {
  items: CartSummaryItem[];
};

type RawCartItem = {
  product: ApiCartProduct | string;
  quantity: number;
};

function mapCartProduct(product: ApiCartProduct | string): CartItem["product"] {
  if (typeof product === "string") {
    return { _id: product, name: "", price: 0, imageUrl: "" };
  }
  const _id = product._id ?? product.id;
  if (!_id) {
    throw new Error("Cart product payload missing id");
  }
  const images = product.images ?? [];
  return {
    _id: String(_id),
    name: product.name ?? "",
    price: product.price ?? 0,
    imageUrl: images[0] ?? product.imageUrl ?? "",
  };
}

export function mapCartSummaryToItems(summary: CartSummary): CartItem[] {
  return summary.items.map((item) => {
    const product = mapCartProduct(item.product);
    return {
      _id: product._id,
      product,
      quantity: item.quantity,
    };
  });
}

export function mapRawCartToItems(cart: RawCartItem[]): CartItem[] {
  return cart.map((item) => {
    const product = mapCartProduct(item.product);
    return {
      _id: product._id,
      product,
      quantity: item.quantity,
    };
  });
}

/** Normalizes GET cart summary or mutation responses that return a raw cart array. */
export function mapCartResponse(data: unknown): { items: CartItem[] } {
  if (Array.isArray(data)) {
    return { items: mapRawCartToItems(data as RawCartItem[]) };
  }
  if (data && typeof data === "object" && "items" in data) {
    return { items: mapCartSummaryToItems(data as CartSummary) };
  }
  return { items: [] };
}
