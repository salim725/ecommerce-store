export type BackendEnvelope<T> = {
  success?: boolean;
  status: number;
  message: string;
  data: T | null;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  pagination?: ApiPagination;
};

export type ApiPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function isBackendEnvelope(
  value: unknown,
): value is BackendEnvelope<unknown> {
  if (typeof value !== "object" || value === null) return false;
  if (
    "success" in value &&
    (value as BackendEnvelope<unknown>).success === true &&
    "data" in value
  ) {
    return true;
  }
  return (
    "status" in value &&
    "message" in value &&
    "data" in value &&
    typeof (value as BackendEnvelope<unknown>).status === "number"
  );
}

export function unwrapApi<T>(body: BackendEnvelope<T>): T {
  if (
    "success" in body &&
    body.success === false
  ) {
    throw new Error(body.message || "Request failed");
  }
    if ("success" in body && body.success === true) {
      return body.data as T;
    }
  if (body.status < 200 || body.status >= 300) {
    throw new Error(body.message || "Request failed");
  }
  return body.data as T;
}

export function getEnvelopePagination(
  body: BackendEnvelope<unknown>,
): ApiPagination | undefined {
  if (body.page == null || body.limit == null || body.total == null) {
    return undefined;
  }
  return {
    page: body.page,
    limit: body.limit,
    total: body.total,
    totalPages: body.totalPages ?? Math.ceil(body.total / body.limit),
  };
}

export type UnwrappedList<T> = {
  data: T;
  pagination?: ApiPagination;
};

/** Unwraps envelope `data` and preserves top-level pagination fields when present. */
export function unwrapApiWithMeta<T>(
  body: BackendEnvelope<T>,
): UnwrappedList<T> {
  const data = unwrapApi(body);
  const pagination = getEnvelopePagination(body);
  return pagination ? { data, pagination } : { data };
}
