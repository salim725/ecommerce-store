"use client";

import { useAppSelector } from "@/src/store/hooks";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

//Swiper requires its own CSS imports — don't forget these or the dots/navigation won't render.
export default function HeroCarousel() {
    const { featured } = useAppSelector((state) => state.products);
  
    if (!featured.length) return null; // don't render if no featured products yet
  
    return (
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={true}
        className="w-full h-[360px] sm:h-[420px] md:h-[480px] rounded-2xl overflow-hidden shadow-xl ring-1 ring-border/50"
      >
        {featured.map((product) => (
          <SwiperSlide key={product._id}>
            <div className="relative w-full h-full">
              {/* Background image */}
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                priority // load hero images immediately (no lazy load)
              />
  
              {/* Dark overlay + text */}
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center p-6">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow">
                  {product.name}
                </h2>
                <p className="text-xl mb-6 drop-shadow">₪{product.price.toFixed(2)}</p>
                <Button asChild size="lg" variant="secondary">
                  <Link href={`/products/${product._id}`}>Shop Now</Link>
                </Button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    );
  }
  //priority on hero images tells Next.js to preload them — important for performance since they're above the fold. The dark overlay 
  // '(bg-black/40) makes the white text readable over any image.