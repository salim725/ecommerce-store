import axiosInstance from "@/src/shared/services/axiosInstance";
import { unwrap } from "@/src/shared/services/apiResponse";
import {
  toAdminOrderRow,
  type OrdersListResponse,
} from "@/src/features/orders/services/ordersApi";

export interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  revenueByMonth: {
    month: string;
    amount: number;
  }[];
}

export interface DashboardOrder {
  _id: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

export const getStats = async (): Promise<Stats> => {
  const response = await axiosInstance.get("admin/stats");
  return unwrap(response);
};

export const getRecentOrders = async (
  limit = 5,
): Promise<DashboardOrder[]> => {
  const response = await axiosInstance.get("orders", {
    params: { page: 1, limit },
  });
  const data = unwrap<OrdersListResponse>(response);
  return data.orders.map(toAdminOrderRow);
};
