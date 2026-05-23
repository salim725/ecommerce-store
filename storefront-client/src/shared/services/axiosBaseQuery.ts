import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosError, AxiosRequestConfig } from "axios";
import axiosInstance from "./axiosInstance";
import { getErrorMessage } from "@/src/shared/utils/getErrorMessage";

type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: unknown;
  params?: unknown;
};

export const axiosBaseQuery =
  (): BaseQueryFn<AxiosBaseQueryArgs, unknown, string> =>
  async ({ url, method = "GET", data, params }) => {
    try {
      const result = await axiosInstance({ url, method, data, params });
      return { data: result.data };
    } catch (error) {
      const err = error as AxiosError;
      return {
        error: getErrorMessage(
          err.response?.data ?? error,
          "Request failed",
        ),
      };
    }
  };
