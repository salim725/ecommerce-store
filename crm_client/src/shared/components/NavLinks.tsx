"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems, isNavActive } from "@/src/shared/constants/nav";
import { cn } from "@/src/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

interface NavLinksProps {
  collapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
}

export default function NavLinks({
  collapsed = false,
  onNavigate,
  className,
}: NavLinksProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider delay={0}>
      <nav className={cn("flex-1 px-3 py-5 space-y-1", className)}>
        {navItems.map((item) => {
          const active = isNavActive(pathname, item.href);
          const Icon = item.icon;
          const linkClassName = cn(
            "flex items-center rounded-lg text-sm font-medium transition-colors duration-150",
            collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
            active
              ? "bg-white/20 text-white shadow-sm backdrop-blur-md border border-white/20"
              : "text-white/50 hover:bg-white/10 hover:text-white",
          );

          const link = (
            <Link
              href={item.href}
              onClick={onNavigate}
              className={linkClassName}
            >
              <Icon size={18} strokeWidth={1.75} aria-hidden />
              {!collapsed && item.label}
            </Link>
          );

          if (!collapsed) {
            return (
              <div key={item.href}>{link}</div>
            );
          }

          return (
            <Tooltip key={item.href}>
              <TooltipTrigger render={link} />
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
