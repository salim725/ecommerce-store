import axiosInstance from "@/src/shared/services/axiosInstance";
import type { CartItem } from "@/src/features/cart/slices/cartSlice";

interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phone: string;
}

export const createOrder = (data: {
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  items: CartItem[];
}) => axiosInstance.post("/orders", data);
