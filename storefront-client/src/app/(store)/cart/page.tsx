import CartPageContent from "@/src/features/cart/components/CartPageContent";
import {
  getProductsServer,
  getFeaturedServer,
} from "@/src/features/products/lib/getProductsServer";

export default async function CartPage() {
  const [products, featured] = await Promise.all([
    getProductsServer(),
    getFeaturedServer(),
  ]);

  const categories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  return (
    <CartPageContent
      crossSellProducts={products}
      categories={categories}
      featuredProduct={featured[0]}
    />
  );
}
