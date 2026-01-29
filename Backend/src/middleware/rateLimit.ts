import type { Context, Next } from "hono";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 100;
const AUTH_MAX_REQUESTS = 20;

export type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

function getKey(c: Context): string {
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "anonymous";
}

function isAuthPath(path: string): boolean {
  return path.endsWith("/auth") || path.endsWith("/auth-download") || path === "/" || path === "";
}

export async function rateLimitMiddleware(c: Context, next: Next): Promise<void | Response> {
  const baseKey = getKey(c);
  const path = new URL(c.req.url).pathname.replace(/^\/file-requests/, "") || "/";
  const isAuth = isAuthPath(path);
  const key = isAuth ? `${baseKey}:auth` : baseKey;
  const limit = isAuth ? AUTH_MAX_REQUESTS : MAX_REQUESTS;
  const now = Date.now();
  let entry: RateLimitEntry | undefined = store.get(key);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    store.set(key, entry);
  }
  entry.count += 1;
  if (entry.count > limit) {
    return c.json({ error: "Too many requests" }, 429);
  }
  await next();
}
