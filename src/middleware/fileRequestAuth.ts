import type { Context, Next } from "hono";
import type { AuthPayload } from "../types/auth.js";
import { isValidObjectId } from "../helpers/objectId.js";

export type FileRequestVariables = { auth: AuthPayload; requestId?: string };

type CtxWithAuth = { Variables: { auth: AuthPayload } };

/**
 * Validates :id param as MongoDB ObjectId. Returns 400 if invalid; otherwise sets requestId and continues.
 * Must run after authMiddleware for protected routes.
 */
export async function requireValidRequestId(c: Context<CtxWithAuth>, next: Next) {
  const id = c.req.param("id");
  if (!isValidObjectId(id)) {
    return c.json({ error: "Invalid request id" }, 400);
  }
  (c as Context<{ Variables: FileRequestVariables }>).set("requestId", id);
  await next();
}

/**
 * Requires auth.requestId === requestId and auth.role === "uploader". Returns 403 otherwise.
 * Must run after authMiddleware and requireValidRequestId.
 */
export async function requireUploader(
  c: Context<{ Variables: FileRequestVariables }>,
  next: Next
) {
  const auth = c.get("auth");
  const requestId = c.get("requestId");
  if (requestId === undefined || auth.requestId !== requestId || auth.role !== "uploader") {
    return c.json({ error: "Forbidden" }, 403);
  }
  await next();
}

/**
 * Requires auth.requestId === requestId (uploader or viewer). Returns 403 otherwise.
 * Must run after authMiddleware and requireValidRequestId.
 */
export async function requireViewer(
  c: Context<{ Variables: FileRequestVariables }>,
  next: Next
) {
  const auth = c.get("auth");
  const requestId = c.get("requestId");
  if (requestId === undefined || auth.requestId !== requestId) {
    return c.json({ error: "Forbidden" }, 403);
  }
  await next();
}
