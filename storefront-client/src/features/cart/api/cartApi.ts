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
      { itemId: string; quantity: number }
    >({
      query: ({ itemId, quantity }) => ({
        url: `/cart/${itemId}`,
        method: "PUT",
        data: { quantity },
      }),
      invalidatesTags: ["Cart"],
    }),
    removeCartItem: builder.mutation<CartResponse, string>({
      query: (itemId) => ({
        url: `/cart/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
    mergeCart: builder.mutation<
      CartResponse,
      { items: { productId: string; quantity: number }[] }
    >({
      query: (body) => ({
        url: "/cart/merge",
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
  useMergeCartMutation,
} = cartApi;
