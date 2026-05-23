import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface BreadcrumbsProps {
  category?: string;
  productName?: string;
  className?: string;
}

export function Breadcrumbs({
  category,
  productName,
  className,
}: BreadcrumbsProps) {
  const items: { label: string; href?: string }[] = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/products" },
  ];

  if (category) {
    items.push({
      label: category,
      href: productName
        ? `/products?category=${encodeURIComponent(category)}`
        : undefined,
    });
  }

  if (productName) {
    items.push({ label: productName });
  } else if (!category) {
    const shop = items[1];
    if (shop) delete shop.href;
  }

  return (
    <Breadcrumb aria-label="Breadcrumb" className={className}>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <span key={`${item.label}-${index}`} className="contents">
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast || !item.href ? (
                  <BreadcrumbPage className="capitalize">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
