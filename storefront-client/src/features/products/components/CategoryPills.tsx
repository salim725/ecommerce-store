import Link from "next/link";
import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryPillsProps {
  categories: string[];
}

export default function CategoryPills({ categories }: CategoryPillsProps) {
  if (!categories.length) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant="outline"
          size="sm"
          asChild
          className="rounded-full px-4"
        >
          <Link href={`/products?category=${encodeURIComponent(category)}`}>
            <Tag className="size-3.5" />
            {category}
          </Link>
        </Button>
      ))}
    </div>
  );
}
