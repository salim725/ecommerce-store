"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import NavLinks from "@/src/shared/components/NavLinks";
import { useSidebarCollapsed } from "@/src/shared/hooks/useSidebarCollapsed";

export default function Sidebar() {
  const { collapsed, toggle: toggleCollapsed } = useSidebarCollapsed();

  return (
    <aside
      className={cn(
        "hidden md:flex min-h-screen flex-col flex-shrink-0 backdrop-blur-lg bg-white/5 border-r border-white/10 transition-[width] duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div
        className={cn(
          "h-16 flex items-center border-b border-gray-700/60 shrink-0",
          collapsed ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        {!collapsed && (
          <span className="text-xl font-bold tracking-tight">
            CRM<span className="text-blue-400">Admin</span>
          </span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={toggleCollapsed}
          className="text-white/50 hover:text-white hover:bg-white/10"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen size={18} aria-hidden />
          ) : (
            <PanelLeftClose size={18} aria-hidden />
          )}
        </Button>
      </div>

      <NavLinks collapsed={collapsed} />

      <div
        className={cn(
          "py-4 border-t border-gray-700/60 shrink-0",
          collapsed ? "px-2 text-center" : "px-6",
        )}
      >
        {!collapsed && (
          <p className="text-xs text-gray-500">CRM Admin · v1.0</p>
        )}
      </div>
    </aside>
  );
}
