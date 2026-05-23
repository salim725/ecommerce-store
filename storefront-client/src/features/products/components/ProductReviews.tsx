"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import type { ProductReviewsPayload } from "@ecommerce/types";
import { StarRating } from "@/src/shared/components/StarRating";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getProductReviews } from "@/src/features/products/services/productsApi";
import { extractApiData } from "@/src/shared/utils/extractApiData";
import { formatDate } from "@/src/shared/utils/formatDate";

function reviewAuthor(
  user: ProductReviewsPayload["reviews"][number]["user"],
): string {
  if (typeof user === "string") return "Customer";
  return user.name ?? "Customer";
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [payload, setPayload] = useState<ProductReviewsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getProductReviews(productId);
        const data = extractApiData<ProductReviewsPayload>(res.data);
        if (!cancelled) setPayload(data);
      } catch {
        if (!cancelled) setError("Could not load reviews.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const reviews = payload?.reviews ?? [];
  const averageRating = payload?.averageRating ?? 0;
  const totalReviews = payload?.totalReviews ?? reviews.length;

  return (
    <section id="reviews" className="scroll-mt-24">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Customer reviews</h2>
        <StarRating
          rating={averageRating}
          count={totalReviews}
          reviewsHref="#reviews"
        />
      </div>

      <Accordion type="single" collapsible defaultValue="reviews">
        <AccordionItem value="reviews">
          <AccordionTrigger>
            {isLoading
              ? "Loading reviews…"
              : `${totalReviews} verified review${totalReviews === 1 ? "" : "s"}`}
          </AccordionTrigger>
          <AccordionContent>
            {error && (
              <p className="text-sm text-muted-foreground">{error}</p>
            )}
            {!error && reviews.length === 0 && !isLoading && (
              <p className="text-sm text-muted-foreground">
                No reviews yet. Be the first to share your experience.
              </p>
            )}
            {reviews.length > 0 && (
              <ul className="space-y-6">
                {reviews.map((review, index) => (
                  <li
                    key={review._id ?? index}
                    className="border-b border-border pb-6 last:border-0 last:pb-0"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <div
                        className="flex items-center gap-0.5"
                        role="img"
                        aria-label={`${review.rating} out of 5 stars`}
                      >
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={
                              i < review.rating
                                ? "size-3.5 fill-primary text-primary"
                                : "size-3.5 fill-muted text-muted-foreground/40"
                            }
                            aria-hidden
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">
                        {reviewAuthor(review.user)}
                      </span>
                      {review.createdAt && (
                        <span className="text-xs text-muted-foreground">
                          · {formatDate(review.createdAt)}
                        </span>
                      )}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground">
                        {review.comment}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
