"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { logout } from "@/src/features/auth/slices/authSlice";
import { clearCart, loadGuestCart } from "@/src/features/cart/slices/cartSlice";
import { toast } from "react-toastify";
import { Menu, Search, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { selectCartCount } from "@/src/features/cart/slices/cartSlice";
import { setMiniCartOpen } from "@/src/store/slices/uiSlice";
import { SearchInput } from "@/src/shared/components/SearchInput";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const cartCount = useAppSelector(selectCartCount);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    dispatch(clearCart());
    dispatch(loadGuestCart());
    toast.success("Logged out successfully");
  };

  const accountControls = isAuthenticated ? (
    <>
      <Avatar className="hidden size-8 sm:flex">
        <AvatarFallback>{user?.name?.[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>
      <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
        <Link href="/profile">Account</Link>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        className="hidden sm:inline-flex"
      >
        Logout
      </Button>
    </>
  ) : (
    <>
      <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
        <Link href="/login">Login</Link>
      </Button>
      <Button size="sm" asChild className="hidden sm:inline-flex">
        <Link href="/register">Register</Link>
      </Button>
    </>
  );

  const mobileNavLinks = (
    <>
      <Link
        href="/"
        className="text-base hover:text-primary transition-colors"
        onClick={() => setMenuOpen(false)}
      >
        Home
      </Link>
      <Link
        href="/products"
        className="text-base hover:text-primary transition-colors"
        onClick={() => setMenuOpen(false)}
      >
        Shop
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/80">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4"
        aria-label="Main"
      >
        <Link
          href="/"
          className="shrink-0 text-lg font-semibold tracking-tight text-foreground"
        >
          Everyday Edit
        </Link>

        <Link
          href="/products"
          className="hidden shrink-0 text-sm font-medium hover:text-primary transition-colors md:inline"
        >
          Shop
        </Link>

        <div className="hidden min-w-0 flex-1 md:block md:max-w-md">
          <Suspense
            fallback={
              <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
            }
          >
            <SearchInput />
          </Suspense>
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="min-h-11 min-w-11 md:hidden"
                aria-label="Open search"
              >
                <Search className="size-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="px-4 pb-6">
              <SheetHeader>
                <SheetTitle>Search</SheetTitle>
              </SheetHeader>
              <Suspense fallback={null}>
                <SearchInput
                  autoFocus
                  onNavigate={() => setSearchOpen(false)}
                />
              </Suspense>
            </SheetContent>
          </Sheet>

          <button
            type="button"
            onClick={() => dispatch(setMiniCartOpen(true))}
            className={cn(
              "relative flex min-h-11 min-w-11 items-center justify-center rounded-md",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
            aria-label={
              cartCount > 0 ? `Cart, ${cartCount} items` : "Cart, empty"
            }
          >
            <ShoppingCart className="size-5" aria-hidden />
            {cartCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-medium text-primary-foreground"
                aria-live="polite"
                aria-atomic="true"
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>

          <div className="hidden items-center gap-2 md:flex">
            {accountControls}
          </div>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="min-h-11 min-w-11 md:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-4 pt-10">
              {mobileNavLinks}
              {isAuthenticated ? (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/profile" onClick={() => setMenuOpen(false)}>
                      Account
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMenuOpen(false);
                      void handleLogout();
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/login" onClick={() => setMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register" onClick={() => setMenuOpen(false)}>
                      Register
                    </Link>
                  </Button>
                </>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
