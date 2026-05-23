"use client";

import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { logout } from "@/src/features/auth/slices/authSlice";
import { clearCart, loadGuestCart } from "@/src/features/cart/slices/cartSlice"; 
import { toast } from "react-toastify";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { selectCartCount } from "@/src/features/cart/slices/cartSlice";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const cartCount = useAppSelector(selectCartCount);
  //Reads auth state to decide what to show. Reads cart item count for the badge.
  const handleLogout = async () => {
    await dispatch(logout());
    dispatch(clearCart());
    dispatch(loadGuestCart());
    toast.success("Logged out successfully");
  };

  const navLinks = (
    <>
      <Link href="/" className="hover:text-primary transition-colors">Home</Link>
      <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
    </>
  );

  return (
    <nav className="border-b px-4 py-3 flex items-center justify-between sticky top-0 bg-background z-50">
      {/* Logo */}
      <Link href="/" className="text-xl font-bold">🛍 Storefront</Link>

      {/* Desktop nav links */}
      <div className="hidden md:flex items-center gap-6">
        {navLinks}
      </div>

      {/* Right side — cart + auth */}
      <div className="flex items-center gap-3">
        {/* Cart icon with badge */}
        <Link href="/cart" className="relative">
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>

        {/* Auth buttons */}
        {isAuthenticated ? (
          <div className="hidden md:flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback>{user?.name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
          </div>
        ) : (
          <div className="hidden md:flex gap-2">
            <Button variant="outline" size="sm" asChild><Link href="/login">Login</Link></Button>
            <Button size="sm" asChild><Link href="/register">Register</Link></Button>
          </div>
        )}

        {/* Mobile hamburger menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon"><Menu className="w-5 h-5" /></Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col gap-4 pt-10">
            {navLinks}
            {isAuthenticated ? (
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            ) : (
              <>
                <Button variant="outline" asChild><Link href="/login">Login</Link></Button>
                <Button asChild><Link href="/register">Register</Link></Button>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
//The Sheet component (from shadcn) is a slide-in drawer used as the mobile menu
// . On desktop it's hidden, on mobile the hamburger triggers it.