import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Pin Turbopack root to this app (pnpm + file:../packages/types must not
  // widen resolution to the monorepo parent where `next` is not installed).
  turbopack: {
    root: projectRoot,
  },
  transpilePackages: ["@ecommerce/types"],
};

export default nextConfig;
