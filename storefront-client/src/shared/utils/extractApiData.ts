import { isBackendEnvelope, unwrapApi } from "./unwrapApi";

/** Unwraps axios/fetch JSON that may be a backend `{ status, message, data }` envelope. */
export function extractApiData<T>(body: unknown): T {
  if (isBackendEnvelope(body)) {
    return unwrapApi(body) as T;
  }
  return body as T;
}
