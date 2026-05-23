import { RefreshCw, ShieldCheck, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const trustItems = [
  {
    icon: Truck,
    label: "Delivery in 3–5 business days",
  },
  {
    icon: RefreshCw,
    label: "30-day easy returns",
  },
  {
    icon: ShieldCheck,
    label: "Secure checkout",
  },
] as const;

export interface ProductTrustRowProps {
  className?: string;
}

export function ProductTrustRow({ className }: ProductTrustRowProps) {
  return (
    <ul
      className={cn(
        "grid gap-3 border-t border-border pt-6 sm:grid-cols-3",
        className,
      )}
      aria-label="Purchase guarantees"
    >
      {trustItems.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-start gap-2.5 text-sm">
          <Icon
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden
          />
          <span className="text-muted-foreground">{label}</span>
        </li>
      ))}
    </ul>
  );
}
