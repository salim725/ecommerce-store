"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import ProductImage from "@/src/shared/components/ProductImage";
import Link from "next/link";
import type { Product } from "@/src/features/products/lib/getProductsServer";

import "swiper/css";
import "swiper/css/pagination";

interface HeroCarouselProps {
  featured: Product[];
}

export default function HeroCarousel({ featured }: HeroCarouselProps) {
  if (!featured.length) {
    return (
      <div
        className="aspect-[4/5] w-full rounded-2xl bg-muted ring-1 ring-border/50"
        aria-hidden
      />
    );
  }

  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      autoplay={{ delay: 4500, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      loop={featured.length > 1}
      className="hero-carousel aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-border/50"
    >
      {featured.map((product) => (
        <SwiperSlide key={product._id}>
          <Link
            href={`/products/${product._id}`}
            className="relative block h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <span className="sr-only">View {product.name}</span>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
