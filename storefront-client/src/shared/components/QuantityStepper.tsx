"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuantityStepperProps {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  label?: string;
  className?: string;
  id?: string;
}

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  label = "Quantity",
  className,
  id = "product-quantity",
}: QuantityStepperProps) {
  const decrease = () => onChange(Math.max(min, value - 1));
  const increase = () => onChange(Math.min(max, value + 1));

  return (
    <div className={cn("space-y-2", className)}>
      <span id={`${id}-label`} className="text-sm font-medium">
        {label}
      </span>
      <div
        className="inline-flex items-center rounded-lg border border-border"
        role="group"
        aria-labelledby={`${id}-label`}
      >
        <button
          type="button"
          onClick={decrease}
          disabled={value <= min}
          className="flex size-11 items-center justify-center rounded-l-lg transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Decrease quantity"
        >
          <Minus className="size-4" aria-hidden />
        </button>
        <span
          id={id}
          className="flex min-w-11 items-center justify-center border-x border-border px-3 text-sm font-medium tabular-nums"
          aria-live="polite"
          aria-atomic="true"
        >
          {value}
        </span>
        <button
          type="button"
          onClick={increase}
          disabled={value >= max}
          className="flex size-11 items-center justify-center rounded-r-lg transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Increase quantity"
        >
          <Plus className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
