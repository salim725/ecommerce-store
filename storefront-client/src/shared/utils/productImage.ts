const BYPASS_OPTIMIZER_HOSTS = new Set([
  "images.unsplash.com",
  "plus.unsplash.com",
]);

/** Skip Next.js image optimization for hosts that often time out in dev. */
export function shouldBypassImageOptimizer(src: string): boolean {
  try {
    return BYPASS_OPTIMIZER_HOSTS.has(new URL(src).hostname);
  } catch {
    return false;
  }
}
