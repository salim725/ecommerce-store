import type { Product } from "./getProductsServer";

type ApiProduct = {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  images?: string[];
  imageUrl?: string;
  stock?: number;
  category?: string;
  description?: string;
};

export function mapProductFromApi(product: ApiProduct): Product {
  const images = product.images ?? [];
  const _id = product._id ?? product.id;
  if (!_id) {
    throw new Error("Product payload missing id");
  }
  return {
    _id: String(_id),
    name: product.name,
    price: product.price,
    imageUrl: images[0] ?? product.imageUrl ?? "",
    images: images.length > 0 ? images : undefined,
    stock: product.stock ?? 0,
    category: product.category ?? "",
    description: product.description,
  };
}

export function mapProductsFromApi(products: ApiProduct[]): Product[] {
  return products.map(mapProductFromApi);
}
