import { storefrontApi } from "@/src/shared/services/storefrontApi";
import type { CartItem } from "../slices/cartSlice";

type CartResponse = { items: CartItem[] };

export const cartApi = storefrontApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<CartResponse, void>({
      query: () => ({ url: "/cart" }),
      providesTags: ["Cart"],
    }),
    addToCart: builder.mutation<
      CartResponse,
      { productId: string; quantity: number }
    >({
      query: ({ productId, quantity }) => ({
        url: "/cart",
        method: "POST",
        data: { productId, quantity },
      }),
      invalidatesTags: ["Cart"],
    }),
    updateCartItem: builder.mutation<
      CartResponse,
      { productId: string; quantity: number }
    >({
      query: ({ productId, quantity }) => ({
        url: `/cart/${productId}`,
        method: "PUT",
        data: { quantity },
      }),
      invalidatesTags: ["Cart"],
    }),
    removeCartItem: builder.mutation<CartResponse, string>({
      query: (productId) => ({
        url: `/cart/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
    syncCart: builder.mutation<
      CartResponse,
      { items: { productId: string; quantity: number }[] }
    >({
      query: (body) => ({
        url: "/cart/sync",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useSyncCartMutation,
} = cartApi;
