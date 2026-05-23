import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t mt-auto bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="text-sm font-semibold">Everyday Edit</p>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs">
              Curated essentials for everyday life. Quality pieces you will
              reach for again and again.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Shop</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/products"
                  className="hover:text-foreground transition-colors"
                >
                  All products
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="hover:text-foreground transition-colors"
                >
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Account</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/profile"
                  className="hover:text-foreground transition-colors"
                >
                  My account
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-foreground transition-colors"
                >
                  Sign in
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-muted-foreground">
            © {year} Everyday Edit. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 shrink-0" aria-hidden />
            Secure checkout · Visa, Mastercard, Amex
          </p>
        </div>
      </div>
    </footer>
  );
}
