import Link from "next/link";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import HeroCarousel from "@/src/features/products/components/HeroCarousal";
import ProductsGrid from "@/src/features/products/components/ProductsGrid";
import CategoryPills from "@/src/features/products/components/CategoryPills";
import HomeNewsletter from "@/src/features/products/components/HomeNewsletter";
import {
  getProductsServer,
  getFeaturedServer,
} from "@/src/features/products/lib/getProductsServer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TRUST_FEATURES = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over ₪199",
  },
  {
    icon: ShieldCheck,
    title: "Secure Checkout",
    description: "Encrypted payments",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    description: "30-day hassle-free",
  },
  {
    icon: Sparkles,
    title: "Curated Picks",
    description: "Quality you can trust",
  },
] as const;

export default async function HomePage() {
  const [products, featured] = await Promise.all([
    getProductsServer(),
    getFeaturedServer(),
  ]);

  const categories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  return (
    <div className="flex flex-col">
      <div className="bg-primary text-primary-foreground text-center text-sm py-2.5 px-4">
        <span className="font-medium">Spring Sale</span>
        <span className="mx-2 opacity-60">·</span>
        <span className="opacity-90">Up to 40% off selected items</span>
        <Link
          href="#products"
          className="ml-2 inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline"
        >
          Shop now
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <section className="relative overflow-hidden border-b">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,var(--color-muted),transparent)]"
          aria-hidden
        />
        <div className="max-w-7xl mx-auto px-4 pt-10 pb-8 md:pt-14 md:pb-10">
          <div className="mb-8 max-w-2xl">
            <Badge variant="secondary" className="mb-4">
              New season · Just dropped
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Style that fits
              <span className="block text-muted-foreground">your everyday.</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Discover curated essentials, limited drops, and customer favorites
              — delivered fast with secure checkout.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="#products">
                  Browse collection
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/products">View all products</Link>
              </Button>
            </div>
          </div>

          <HeroCarousel featured={featured} />
        </div>
      </section>

      <section className="border-b bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
            {TRUST_FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col items-center text-center md:items-start md:text-left"
              >
                <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-background border shadow-sm">
                  <Icon className="size-5 text-foreground" />
                </div>
                <h3 className="font-semibold text-sm">{title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto w-full px-4 py-14">
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Collections
          </p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
            Shop by category
          </h2>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            {categories.length > 0
              ? "Jump straight into what you're looking for."
              : "Categories will appear as products load."}
          </p>
        </div>
        <CategoryPills categories={categories} />
      </section>

      <section
        id="products"
        className="max-w-7xl mx-auto w-full px-4 pb-16 scroll-mt-20"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Catalog
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Our products
            </h2>
            <p className="mt-2 text-muted-foreground">
              Fresh picks updated regularly. Add to cart in one click.
            </p>
          </div>
          <Button
            variant="outline"
            asChild
            className="shrink-0 self-start sm:self-auto"
          >
            <Link href="/products">
              View all
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <ProductsGrid products={products} />
      </section>

      <section className="max-w-7xl mx-auto w-full px-4 pb-16">
        <div className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground px-6 py-12 md:px-12 md:py-16">
          <div
            className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary-foreground/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-10 size-48 rounded-full bg-primary-foreground/5 blur-2xl"
            aria-hidden
          />
          <div className="relative max-w-xl">
            <Badge className="mb-4 bg-primary-foreground/15 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20">
              Members only
            </Badge>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Get 15% off your first order
            </h2>
            <p className="mt-3 text-primary-foreground/80 leading-relaxed">
              Create an account today and unlock exclusive deals, early access to
              sales, and faster checkout.
            </p>
            <Button size="lg" variant="secondary" className="mt-6" asChild>
              <Link href="/register">
                Create free account
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <HomeNewsletter />
    </div>
  );
}
