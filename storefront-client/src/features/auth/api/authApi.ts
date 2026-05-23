import { storefrontApi } from "@/src/shared/services/storefrontApi";
import type { User } from "../slices/authSlice";

type AuthResponse = { user: User; token: string };

export const authApi = storefrontApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        data: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),
    register: builder.mutation<
      AuthResponse,
      { name: string; email: string; password: string }
    >({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Auth"],
    }),
    getMe: builder.query<{ user: User }, void>({
      query: () => ({ url: "/auth/me" }),
      providesTags: ["Auth"],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: ["Auth", "Cart"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLogoutMutation,
} = authApi;
