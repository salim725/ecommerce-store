import ProductImage from "@/src/shared/components/ProductImage";
import Link from "next/link";
import type { Product } from "@/src/features/products/lib/getProductsServer";
import { cn } from "@/lib/utils";

interface CategoryTilesProps {
  categories: string[];
  products: Product[];
}

function getCategoryImage(
  category: string,
  products: Product[],
): string | null {
  const match = products.find(
    (p) => p.category.toLowerCase() === category.toLowerCase(),
  );
  return match?.imageUrl ?? null;
}

export default function CategoryTiles({
  categories,
  products,
}: CategoryTilesProps) {
  if (!categories.length) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {categories.map((category) => {
        const imageUrl = getCategoryImage(category, products);
        const href = `/products?category=${encodeURIComponent(category)}`;

        return (
          <Link
            key={category}
            href={href}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-xl ring-1 ring-border/60",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          >
            {imageUrl ? (
              <ProductImage
                src={imageUrl}
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div
                className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20"
                aria-hidden
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <span className="absolute bottom-0 left-0 right-0 p-3 text-sm font-semibold capitalize text-white">
              {category}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
