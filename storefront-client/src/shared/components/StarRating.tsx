import Link from "next/link";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StarRatingProps {
  rating?: number;
  count?: number;
  reviewsHref?: string;
  className?: string;
}

export function StarRating({
  rating = 4,
  count = 128,
  reviewsHref = "#reviews",
  className,
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`${rating} out of 5 stars`}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < fullStars || (i === fullStars && hasHalf);
          return (
            <Star
              key={i}
              className={cn(
                "size-4 shrink-0",
                filled
                  ? "fill-primary text-primary"
                  : "fill-muted text-muted-foreground/40",
              )}
              aria-hidden
            />
          );
        })}
      </div>
      <Link
        href={reviewsHref}
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        {rating.toFixed(1)} · {count.toLocaleString()} reviews
      </Link>
    </div>
  );
}
