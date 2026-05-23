import type { AxiosResponse } from "axios";

type LegacyEnvelope<T> = {
  status: number;
  message: string;
  data: T | null;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

type SuccessEnvelope<T> = {
  success: true;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

type ErrorEnvelope = {
  success: false;
  message: string;
  errors?: Record<string, string>;
};

function isLegacyEnvelope(value: unknown): value is LegacyEnvelope<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    "message" in value &&
    "data" in value
  );
}

function isSuccessEnvelope(value: unknown): value is SuccessEnvelope<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    (value as SuccessEnvelope<unknown>).success === true &&
    "data" in value
  );
}

function isErrorEnvelope(value: unknown): value is ErrorEnvelope {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    (value as ErrorEnvelope).success === false
  );
}

/** Unwraps backend JSON from axios — supports legacy `{ status, data }` and `{ success, data }`. */
export function unwrap<T>(res: AxiosResponse<unknown>): T {
  const body = res.data;

  if (isErrorEnvelope(body)) {
    throw new Error(body.message || "Request failed");
  }

  if (isSuccessEnvelope(body)) {
    return body.data as T;
  }

  if (isLegacyEnvelope(body)) {
    if (body.status < 200 || body.status >= 300) {
      throw new Error(body.message || "Request failed");
    }
    return body.data as T;
  }

  return body as T;
}
