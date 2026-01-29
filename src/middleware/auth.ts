import type { Context, Next } from "hono";
import type { AuthPayload } from "../types/auth.js";
import { verifyToken } from "../services/auth.js";

export type { AuthPayload } from "../types/auth.js";

export async function authMiddleware(c: Context, next: Next) {
  const auth = c.req.header("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid Authorization header" }, 401);
  }
  const token = auth.slice(7);
  try {
    const payload = verifyToken(token);
    c.set("auth", payload as AuthPayload);
    await next();
  } catch {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
}
