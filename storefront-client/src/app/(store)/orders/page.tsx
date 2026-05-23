"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/src/store/hooks";
import { fetchMyOrders } from "@/src/features/profile/slices/profileSlice";
import OrdersHistory from "@/src/features/profile/components/OrdersHistory";

export default function OrdersPage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      <OrdersHistory />
    </main>
  );
}
