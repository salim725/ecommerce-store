import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosError, AxiosRequestConfig } from "axios";
import axiosInstance from "./axiosInstance";
import { normalizeApiResponse } from "@/src/shared/utils/normalizeApiResponse";
import { getErrorMessage } from "@/src/shared/utils/getErrorMessage";
import {
  isBackendEnvelope,
  unwrapApi,
  unwrapApiWithMeta,
  type ApiPagination,
} from "@/src/shared/utils/unwrapApi";

type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: unknown;
  params?: unknown;
  /** When true, list envelopes also return `{ items, pagination }` instead of a bare array. */
  paginated?: boolean;
};

export type PaginatedResult<T> = {
  items: T[];
  pagination: ApiPagination;
};

export const axiosBaseQuery =
  (): BaseQueryFn<AxiosBaseQueryArgs, unknown, string> =>
  async ({ url, method = "GET", data, params, paginated }) => {
    try {
      const result = await axiosInstance({ url, method, data, params });
      const body = result.data;

      if (!isBackendEnvelope(body)) {
        return { data: body };
      }

      if (paginated) {
        const { data: unwrapped, pagination } = unwrapApiWithMeta(body);
        const normalized = normalizeApiResponse(url, unwrapped);
        if (pagination && Array.isArray(normalized)) {
          return {
            data: { items: normalized, pagination } satisfies PaginatedResult<
              (typeof normalized)[number]
            >,
          };
        }
        return { data: normalized };
      }

      const unwrapped = unwrapApi(body);
      const normalized = normalizeApiResponse(url, unwrapped);
      return { data: normalized };
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
