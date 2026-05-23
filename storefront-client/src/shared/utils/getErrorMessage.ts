import { isAxiosError } from "axios";

export function getErrorMessage(
  err: unknown,
  fallback = "Something went wrong",
): string {
  if (typeof err === "string") return err;

  if (isAxiosError(err)) {
    const data = err.response?.data;
    if (
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
    ) {
      return (data as { message: string }).message;
    }
    return err.message || fallback;
  }

  if (err instanceof Error) return err.message;

  return fallback;
}
