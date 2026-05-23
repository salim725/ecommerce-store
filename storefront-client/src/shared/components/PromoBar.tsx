"use client";

import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";

const STORAGE_KEY = "everyday_edit_promo_dismissed";

export default function PromoBar() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "true") {
      setVisible(false);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Promotion"
      className="relative bg-primary px-4 py-2.5 text-center text-sm text-primary-foreground"
    >
      <span className="font-medium">Spring Sale</span>
      <span className="mx-2 opacity-60">·</span>
      <span className="opacity-90">Up to 40% off selected items</span>
      <a
        href="#products"
        className="ml-2 inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline"
      >
        Shop now
        <ArrowRight className="size-3.5" aria-hidden />
      </a>
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
        aria-label="Dismiss promotion"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
