import type { CorsOptions } from "cors";

interface CorsClient {
  origin: string;
  methods?: string[];
  allowedHeaders?: string[];
}

const clients: CorsClient[] = JSON.parse(process.env.CORS_CLIENTS || "[]");

function mergeUnique(arrays: (string[] | undefined)[]): string[] {
  const set = new Set<string>();
  for (const arr of arrays) {
    arr?.forEach((value) => set.add(value));
  }
  return [...set];
}

const DEFAULT_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];
const DEFAULT_HEADERS = ["Content-Type", "Authorization"];

const mergedMethods = mergeUnique(clients.map((c) => c.methods));
const mergedHeaders = mergeUnique(clients.map((c) => c.allowedHeaders));

export const corsOptions: CorsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) {
    // No Origin: allow in dev / when explicitly enabled (e.g. Postman, server-to-server)
    if (!origin) {
      const allowNoOrigin =
        process.env.NODE_ENV !== "production" ||
        process.env.CORS_ALLOW_NO_ORIGIN === "true";
      if (allowNoOrigin) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    }

    const client = clients.find((c) => c.origin === origin);

    if (client) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods:
    mergedMethods.length > 0 ? mergedMethods : DEFAULT_METHODS,
  allowedHeaders:
    mergedHeaders.length > 0 ? mergedHeaders : DEFAULT_HEADERS,
  credentials: true,
  maxAge: 86400,
};
