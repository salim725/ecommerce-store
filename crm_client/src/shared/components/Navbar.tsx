"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { logout } from "@/src/features/auth/slices/authSlice";
import { redirectTo } from "@/src/shared/utils/redirectTo";
import { Button } from "@/src/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";
import { ChevronRight, LogOut, Menu, UserCircle } from "lucide-react";
import NotificationBell from "@/src/shared/components/NotificationBell";
import NavLinks from "@/src/shared/components/NavLinks";
import { getPageLabel } from "@/src/shared/constants/nav";

function Breadcrumbs() {
  const pathname = usePathname();
  const label = getPageLabel(pathname);

  if (pathname === "/") {
    return (
      <span className="text-sm font-medium text-white/90">Dashboard</span>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      <Link
        href="/"
        className="text-white/50 hover:text-white/90 transition-colors"
      >
        Dashboard
      </Link>
      <ChevronRight size={14} className="text-white/40 shrink-0" aria-hidden />
      <span className="font-medium text-white/90">{label}</span>
    </nav>
  );
}

export default function Navbar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    redirectTo("/login");
  };

  return (
    <header className="h-16 backdrop-blur-lg bg-white/5 border-b border-white/10 flex items-center justify-between px-4 md:px-6 shrink-0 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="md:hidden text-white/70 hover:text-white hover:bg-white/10"
                aria-label="Open navigation menu"
              />
            }
          >
            <Menu size={20} aria-hidden />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-72 bg-slate-900 border-white/10 text-white p-0"
            showCloseButton
          >
            <SheetHeader className="border-b border-white/10 px-4 py-4">
              <SheetTitle className="text-left text-white">
                CRM<span className="text-blue-400">Admin</span>
              </SheetTitle>
            </SheetHeader>
            <NavLinks
              onNavigate={() => setMobileOpen(false)}
              className="py-2"
            />
          </SheetContent>
        </Sheet>

        <div className="hidden sm:flex items-center gap-1.5 text-sm text-white/50 min-w-0">
          <Breadcrumbs />
        </div>
        <div className="sm:hidden min-w-0 truncate text-sm text-white/50">
          <span className="text-white/50">Hi, </span>
          <span className="font-semibold text-white/90 truncate">
            {user?.name ?? "Admin"}
          </span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-1.5 text-sm text-white/50 shrink-0">
        <span>Welcome back,</span>
        <span className="font-semibold text-white/90">
          {user?.name ?? "Admin"}
        </span>
      </div>

      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <NotificationBell />
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
          <UserCircle size={15} className="text-white/50" aria-hidden />
          <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">
            {user?.role ?? "admin"}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-white/50 hover:text-red-400 hover:bg-red-500/10 gap-2"
        >
          <LogOut size={15} aria-hidden />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
