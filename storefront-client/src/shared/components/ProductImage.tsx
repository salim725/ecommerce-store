import Image, { type ImageProps } from "next/image";
import { shouldBypassImageOptimizer } from "@/src/shared/utils/productImage";

type ProductImageProps = Omit<ImageProps, "unoptimized"> & {
  src: string;
};

export default function ProductImage({ src, ...props }: ProductImageProps) {
  return (
    <Image
      src={src}
      unoptimized={shouldBypassImageOptimizer(src)}
      {...props}
    />
  );
}
