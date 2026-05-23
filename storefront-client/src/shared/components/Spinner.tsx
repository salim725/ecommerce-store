import { cn } from "@/lib/utils"; // shadcn utility for merging classNames

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-4",
};

export default function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "rounded-full border-muted border-t-primary animate-spin",
        sizeMap[size],
        className
      )}
    />
  );
}