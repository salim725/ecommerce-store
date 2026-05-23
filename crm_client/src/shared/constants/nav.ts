import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Bell,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Users", href: "/users", icon: Users },
  { label: "Products", href: "/products", icon: Package },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

export const breadcrumbLabels: Record<string, string> = {
  "/": "Dashboard",
  "/users": "Users",
  "/products": "Products",
  "/orders": "Orders",
  "/notifications": "Notifications",
};

export function getPageLabel(pathname: string): string {
  return breadcrumbLabels[pathname] ?? "Page";
}

export function isNavActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
