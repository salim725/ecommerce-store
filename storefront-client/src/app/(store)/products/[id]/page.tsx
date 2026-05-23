import { notFound } from "next/navigation";
import ProductDetail from "@/src/features/products/components/ProductDetail";
import { getProductByIdServer } from "@/src/features/products/lib/getProductById";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductByIdServer(id);
  if (!product) {
    return { title: "Product" };
  }
  return {
    title: product.name,
    description: product.description || `Buy ${product.name} on Storefront`,
    openGraph: {
      images: [product.imageUrl],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductByIdServer(id);
  if (!product) {
    notFound();
  }
  return <ProductDetail product={product} />;
}
