import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";

export const storefrontApi = createApi({
  reducerPath: "storefrontApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Cart", "Auth"],
  endpoints: () => ({}),
});
