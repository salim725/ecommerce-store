import axiosInstance from "@/src/shared/services/axiosInstance";
import type { ShippingData } from "@/src/features/checkout/components/ShippingForm";
import type { CartItem } from "@/src/features/cart/slices/cartSlice";

export type BackendPaymentMethod =
  | "paypal"
  | "credit"
  | "simulated"
  | "visa";

export function mapPaymentMethodToApi(
  method: "card" | string,
): BackendPaymentMethod {
  if (method === "card") return "credit";
  if (
    method === "paypal" ||
    method === "credit" ||
    method === "simulated" ||
    method === "visa"
  ) {
    return method;
  }
  return "simulated";
}

export function buildCreateOrderBody(
  shippingData: ShippingData,
  items: CartItem[],
  paymentMethod: string = "card",
) {
  return {
    items: items.map((item) => ({
      productId: item.product._id,
      quantity: item.quantity,
    })),
    shippingAddress: {
      street: shippingData.address,
      city: shippingData.city,
      zipCode: shippingData.postalCode,
      country: shippingData.country,
    },
    paymentMethod: mapPaymentMethodToApi(paymentMethod),
  };
}

export const createOrder = (data: {
  shippingData: ShippingData;
  items: CartItem[];
  paymentMethod?: string;
}) =>
  axiosInstance.post(
    "/orders",
    buildCreateOrderBody(data.shippingData, data.items, data.paymentMethod),
  );
