"use client";

import { useState } from "react";
import ProductImage from "@/src/shared/components/ProductImage";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { cn } from "@/lib/utils";

import "swiper/css";
import "swiper/css/pagination";

interface ProductGalleryProps {
  name: string;
  imageUrl: string;
  images?: string[];
  className?: string;
}

export default function ProductGallery({
  name,
  imageUrl,
  images,
  className,
}: ProductGalleryProps) {
  const galleryImages = images && images.length > 0 ? images : [imageUrl];
  const hasMultipleImages = galleryImages.length > 1;
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className={cn("min-w-0 w-full", className)}>
      <div className="md:hidden">
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="aspect-[4/5] overflow-hidden rounded-xl"
        >
          {galleryImages.map((src, index) => (
            <SwiperSlide key={`${src}-${index}`}>
              <GallerySlide src={src} name={name} index={index} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div
        className={cn(
          "hidden md:grid md:gap-3",
          hasMultipleImages
            ? "md:grid-cols-[4.5rem_minmax(0,1fr)]"
            : "md:grid-cols-1",
        )}
      >
        {hasMultipleImages && (
          <ul className="flex max-h-[32rem] flex-col gap-2 overflow-y-auto">
            {galleryImages.map((src, index) => (
              <li key={`${src}-thumb-${index}`}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "relative aspect-square w-full overflow-hidden rounded-lg bg-muted",
                    "ring-2 ring-offset-2 transition-shadow focus-visible:outline-none",
                    activeIndex === index
                      ? "ring-ring"
                      : "ring-transparent hover:ring-border",
                  )}
                  aria-label={`Show image ${index + 1} of ${galleryImages.length}`}
                  aria-current={activeIndex === index ? "true" : undefined}
                >
                  <ProductImage
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="72px"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div
          className={cn(
            "relative w-full overflow-hidden rounded-xl bg-muted",
            hasMultipleImages ? "aspect-[4/5]" : "aspect-square max-h-[36rem]",
          )}
        >
          <ProductImage
            src={galleryImages[activeIndex] ?? imageUrl}
            alt={
              activeIndex === 0 ? name : `${name} view ${activeIndex + 1}`
            }
            fill
            className="object-contain object-center"
            priority={activeIndex === 0}
            sizes={
              hasMultipleImages
                ? "(max-width: 1024px) 100vw, 50vw"
                : "(max-width: 1024px) 100vw, min(50vw, 36rem)"
            }
          />
        </div>
      </div>
    </div>
  );
}

function GallerySlide({
  src,
  name,
  index,
}: {
  src: string;
  name: string;
  index: number;
}) {
  return (
    <div className="relative aspect-[4/5] bg-muted">
      <ProductImage
        src={src}
        alt={index === 0 ? name : `${name} view ${index + 1}`}
        fill
        className="object-contain object-center"
        priority={index === 0}
        sizes="(max-width: 1024px) calc(100vw - 2rem), min(50vw, 36rem)"
      />
    </div>
  );
}
