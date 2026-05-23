import { Star } from "lucide-react";
import { StarRating } from "@/src/shared/components/StarRating";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PLACEHOLDER_REVIEWS = [
  {
    id: "1",
    author: "Sarah M.",
    rating: 5,
    date: "March 2026",
    title: "Perfect everyday piece",
    body: "Great quality and fits true to size. Already ordered another color.",
  },
  {
    id: "2",
    author: "James L.",
    rating: 4,
    date: "February 2026",
    title: "Solid purchase",
    body: "Material feels premium and shipping was fast. Would recommend.",
  },
  {
    id: "3",
    author: "Emily R.",
    rating: 5,
    date: "January 2026",
    title: "Worth it",
    body: "Exactly as described. The photos do not do it justice.",
  },
] as const;

export default function ProductReviews() {
  return (
    <section id="reviews" className="scroll-mt-24">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Customer reviews</h2>
        <StarRating />
      </div>

      <Accordion type="single" collapsible defaultValue="reviews">
        <AccordionItem value="reviews">
          <AccordionTrigger>
            {PLACEHOLDER_REVIEWS.length} verified reviews
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-6">
              {PLACEHOLDER_REVIEWS.map((review) => (
                <li
                  key={review.id}
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
                    <span className="text-sm font-medium">{review.author}</span>
                    <span className="text-xs text-muted-foreground">
                      · {review.date}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{review.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {review.body}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-muted-foreground">
              Sample reviews shown until the reviews API is connected.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
