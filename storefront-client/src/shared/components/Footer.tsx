import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear(); // auto-updates every year

  return (
    <footer className="border-t mt-auto py-8 bg-background">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <p className="text-sm font-semibold">🛍 Storefront</p>

        {/* Links */}
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="/products" className="hover:text-foreground transition-colors">
            Products
          </Link>
          <Link href="/cart" className="hover:text-foreground transition-colors">
            Cart
          </Link>
          <Link href="/profile" className="hover:text-foreground transition-colors">
            My Account
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-xs text-muted-foreground">
          © {year} Storefront. All rights reserved.
        </p>
      </div>
    </footer>
  );
}