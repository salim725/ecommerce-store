"use client";

import { useEffect } from "react";
import { toast } from "react-toastify";
import StatsCard from "./StatsCard";
import RevenueChart from "./RevenueChart";
import RecentOrders from "./RecentOrders";
import ContentPanel from "@/src/shared/components/ContentPanel";
import { Users, ShoppingCart, Package, DollarSign } from "lucide-react";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { fetchDashboard } from "../slices/dashboardSlice";
import { formatPrice } from "@/src/shared/utils/formatPrice";

export default function DashboardView() {
  const dispatch = useAppDispatch();
  const { stats, recentOrders, isLoading, error } = useAppSelector(
    (state) => state.dashboard,
  );

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <ContentPanel className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of your store performance
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="bg-purple-500"
          />
          <StatsCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={ShoppingCart}
            color="bg-blue-500"
          />
          <StatsCard
            title="Total Products"
            value={stats.totalProducts}
            icon={Package}
            color="bg-orange-500"
          />
          <StatsCard
            title="Total Revenue"
            value={formatPrice(stats.totalRevenue)}
            icon={DollarSign}
            color="bg-green-500"
          />
        </div>

        <RevenueChart data={stats.revenueByMonth} />
        <RecentOrders orders={recentOrders} />
      </ContentPanel>
    </div>
  );
}
