"use client";

import { useAppSelector } from "@/src/store/hooks";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { formatPrice } from "@/src/shared/utils/formatPrice";
import { formatDate } from "@/src/shared/utils/formatDate";
import Spinner from "@/src/shared/components/Spinner";

// Status badge colors
const statusConfig = {
  pending:   { label: "Pending",   className: "bg-yellow-100 text-yellow-800" },
  paid:      { label: "Paid",      className: "bg-green-100 text-green-800" },
  shipped:   { label: "Shipped",   className: "bg-blue-100 text-blue-800" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" },
};
export default function OrdersHistory() {
    const router = useRouter();
    const { orders, isLoading } = useAppSelector((s) => s.profile);

    if (isLoading && orders.length === 0) {
      return (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      );
    }

    // Empty state
    if (orders.length === 0) {
      return (
        <div className="text-center py-12">
          <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No orders yet</p>
          <Button className="mt-4" onClick={() => router.push("/")}>
            Start Shopping
          </Button>
        </div>
      );
    }
  
    return (
      <div className="space-y-3">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-5 text-xs font-semibold text-muted-foreground uppercase px-4">
          <span>Order ID</span>
          <span>Date</span>
          <span>Items</span>
          <span>Total</span>
          <span>Status</span>
        </div>
  
        {orders.map((order) => {
          const status = statusConfig[order.status] ?? statusConfig.pending;
          const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
  
          return (
            <div
              key={order._id}
              className="grid grid-cols-2 md:grid-cols-5 gap-2 border rounded-lg p-4 items-center hover:bg-muted/50 transition-colors"
            >
              <span className="font-mono text-xs text-muted-foreground truncate">
                #{order._id.slice(-8)}
              </span>
              <span className="text-sm">{formatDate(order.createdAt)}</span>
              <span className="text-sm">{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
              <span className="font-semibold">{formatPrice(order.totalPrice)}</span>
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.className}`}>
                  {status.label}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/orders/${order._id}`)}
                >
                  View
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }