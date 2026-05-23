/** Full navigation — safe before the App Router client queue is ready. */
export function redirectTo(href: string) {
  if (typeof window === "undefined") return;
  window.location.assign(href);
}
