"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProductImage from "@/src/shared/components/ProductImage";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  selectCartItems,
  selectCartCount,
  selectCartTotal,
  updateItem,
  removeItem,
  type CartItem,
} from "@/src/features/cart/slices/cartSlice";
import {
  selectMiniCartOpen,
  setMiniCartOpen,
} from "@/src/store/slices/uiSlice";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/src/shared/utils/formatPrice";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "react-toastify";

export default function MiniCartDrawer() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const open = useAppSelector(selectMiniCartOpen);
  const items = useAppSelector(selectCartItems);
  const count = useAppSelector(selectCartCount);
  const total = useAppSelector(selectCartTotal);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleOpenChange = (next: boolean) => {
    dispatch(setMiniCartOpen(next));
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    setUpdatingId(itemId);
    try {
      await dispatch(
        updateItem({ itemId, quantity, isAuthenticated }),
      ).unwrap();
    } catch {
      toast.error("Could not update quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId: string, name: string) => {
    try {
      await dispatch(removeItem({ itemId, isAuthenticated })).unwrap();
      toast.info(`${name} removed from cart`);
    } catch {
      toast.error("Could not remove item");
    }
  };

  const handleCheckout = () => {
    dispatch(setMiniCartOpen(false));
    router.push("/checkout");
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col sm:max-w-md"
        aria-describedby={items.length === 0 ? "mini-cart-empty" : undefined}
      >
        <SheetHeader className="border-b pb-4">
          <SheetTitle>
            Your cart
            {count > 0 && (
              <span className="font-normal text-muted-foreground">
                {" "}
                ({count} {count === 1 ? "item" : "items"})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <MiniCartEmpty onClose={() => handleOpenChange(false)} />
        ) : (
          <>
            <ul className="flex-1 space-y-4 overflow-y-auto py-4">
              {items.map((item) => (
                <MiniCartLineItem
                  key={item._id}
                  item={item}
                  updating={updatingId === item._id}
                  onUpdate={(qty) => void handleUpdateQuantity(item._id, qty)}
                  onRemove={() => void handleRemove(item._id, item.product.name)}
                />
              ))}
            </ul>

            <SheetFooter className="border-t pt-4">
              <MiniCartSummary total={total} count={count} />
              <Button
                className="w-full min-h-11"
                size="lg"
                onClick={handleCheckout}
              >
                Checkout · {formatPrice(total)}
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/cart" onClick={() => handleOpenChange(false)}>
                  View full cart
                </Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function MiniCartEmpty({ onClose }: { onClose: () => void }) {
  return (
    <div
      id="mini-cart-empty"
      className="flex flex-1 flex-col items-center justify-center gap-4 py-12 text-center"
    >
      <ShoppingBag className="size-12 text-muted-foreground" aria-hidden />
      <p className="text-muted-foreground">Your cart is empty</p>
      <Button asChild onClick={onClose}>
        <Link href="/products">Continue shopping</Link>
      </Button>
    </div>
  );
}

function MiniCartLineItem({
  item,
  updating,
  onUpdate,
  onRemove,
}: {
  item: CartItem;
  updating: boolean;
  onUpdate: (qty: number) => void;
  onRemove: () => void;
}) {
  return (
    <li className="flex gap-3">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        <ProductImage
          src={item.product.imageUrl}
          alt={item.product.name}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
      <MiniCartLineContent
        item={item}
        updating={updating}
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    </li>
  );
}

function MiniCartLineContent({
  item,
  updating,
  onUpdate,
  onRemove,
}: {
  item: CartItem;
  updating: boolean;
  onUpdate: (qty: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium">{item.product.name}</p>
      <p className="text-sm text-muted-foreground">
        {formatPrice(item.product.price)}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <MiniCartQtyControls
          quantity={item.quantity}
          updating={updating}
          onUpdate={onUpdate}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label={`Remove ${item.product.name}`}
        >
          <Trash2 className="size-4 text-destructive" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

function MiniCartQtyControls({
  quantity,
  updating,
  onUpdate,
}: {
  quantity: number;
  updating: boolean;
  onUpdate: (qty: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-border">
      <button
        type="button"
        onClick={() => onUpdate(quantity - 1)}
        disabled={updating || quantity <= 1}
        className="flex size-9 items-center justify-center rounded-l-lg hover:bg-muted disabled:opacity-40"
        aria-label="Decrease quantity"
      >
        <Minus className="size-3.5" aria-hidden />
      </button>
      <span className="min-w-8 border-x border-border px-2 text-center text-sm tabular-nums">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onUpdate(quantity + 1)}
        disabled={updating}
        className="flex size-9 items-center justify-center rounded-r-lg hover:bg-muted disabled:opacity-40"
        aria-label="Increase quantity"
      >
        <Plus className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}

function MiniCartSummary({ total, count }: { total: number; count: number }) {
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal ({count})</span>
        <span className="font-medium">{formatPrice(total)}</span>
      </div>
      <MiniCartShippingRow />
      <Separator />
      <div className="flex justify-between font-bold">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  );
}

function MiniCartShippingRow() {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">Shipping</span>
      <span className="font-medium text-primary">Free</span>
    </div>
  );
}
