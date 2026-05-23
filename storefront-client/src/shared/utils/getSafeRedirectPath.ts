/** Returns a same-origin path for post-login redirect; rejects open redirects. */
export function getSafeRedirectPath(from: string | null): string {
  if (!from || !from.startsWith("/") || from.startsWith("//")) {
    return "/";
  }
  return from;
}
