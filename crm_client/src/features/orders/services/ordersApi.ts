import axiosInstance from "@/src/shared/services/axiosInstance";
import { unwrap } from "@/src/shared/services/apiResponse";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

interface PopulatedUser {
  name: string;
  email?: string;
}

export interface BackendOrder {
  _id: string;
  user: PopulatedUser | string;
  totalPrice: number;
  orderStatus: OrderStatus;
  createdAt: string;
}

export interface OrdersListResponse {
  orders: BackendOrder[];
  page: number;
  totalPages: number;
  totalOrders: number;
}

/** Admin table row shape */
export interface Order {
  _id: string;
  customerName: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  [key: string]: unknown;
}

export function toAdminOrderRow(order: BackendOrder): Order {
  const user = order.user;
  const customerName =
    typeof user === "object" && user !== null && "name" in user
      ? user.name
      : "Unknown";

  return {
    _id: String(order._id),
    customerName,
    total: order.totalPrice,
    status: order.orderStatus,
    createdAt: order.createdAt,
  };
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
}

export const getOrders = async (
  params: GetOrdersParams = {},
): Promise<{ orders: Order[]; page: number; totalPages: number; totalOrders: number }> => {
  const response = await axiosInstance.get("orders", {
    params: { page: params.page ?? 1, limit: params.limit ?? 100 },
  });
  const data = unwrap<OrdersListResponse>(response);
  return {
    orders: data.orders.map(toAdminOrderRow),
    page: data.page,
    totalPages: data.totalPages,
    totalOrders: data.totalOrders,
  };
};

export const putOrderStatus = async (
  id: string,
  orderStatus: OrderStatus,
): Promise<Order> => {
  const response = await axiosInstance.put(`orders/${id}/status`, {
    orderStatus,
  });
  const order = unwrap<BackendOrder>(response);
  return toAdminOrderRow(order);
};
