import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import {
  verifyUploadToken,
  verifyDownloadToken,
  verifyPartToken,
  storeChunk,
  getStored,
  appendPart,
} from "../services/mockS3.js";

const app = new Hono();
const UPLOAD_BODY_LIMIT = 100 * 1024 * 1024; // 100MB

app.put("/upload", bodyLimit({ maxSize: UPLOAD_BODY_LIMIT, onError: (c) => c.json({ error: "Request body too large" }, 413) }), async (c) => {
  const key = c.req.query("key");
  const token = c.req.query("token");
  if (!key || !token) {
    return c.json({ error: "Missing key or token" }, 400);
  }
  try {
    const { key: verifiedKey } = verifyUploadToken(token);
    if (verifiedKey !== decodeURIComponent(key)) {
      return c.json({ error: "Key mismatch" }, 403);
    }
  } catch {
    return c.json({ error: "Invalid or expired token" }, 403);
  }
  const body = await c.req.arrayBuffer();
  await storeChunk(decodeURIComponent(key), Buffer.from(body));
  return c.json({ ok: true }, 200);
});

app.get("/download", async (c) => {
  const key = c.req.query("key");
  const token = c.req.query("token");
  if (!key || !token) {
    return c.json({ error: "Missing key or token" }, 400);
  }
  try {
    const { key: verifiedKey } = verifyDownloadToken(token);
    if (verifiedKey !== decodeURIComponent(key)) {
      return c.json({ error: "Key mismatch" }, 403);
    }
  } catch {
    return c.json({ error: "Invalid or expired token" }, 403);
  }
  const decodedKey = decodeURIComponent(key);
  const buffer = await getStored(decodedKey);
  if (!buffer) {
    return c.json({ error: "Not found" }, 404);
  }
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(buffer.length),
    },
  });
});

app.put("/multipart/part", bodyLimit({ maxSize: UPLOAD_BODY_LIMIT, onError: (c) => c.json({ error: "Request body too large" }, 413) }), async (c) => {
  const key = c.req.query("key");
  const uploadId = c.req.query("uploadId");
  const partNumber = c.req.query("partNumber");
  const token = c.req.query("token");
  if (!key || !uploadId || !partNumber || !token) {
    return c.json({ error: "Missing query params" }, 400);
  }
  try {
    const verified = verifyPartToken(token);
    if (
      verified.key !== decodeURIComponent(key) ||
      verified.uploadId !== decodeURIComponent(uploadId) ||
      verified.partNumber !== Number(partNumber)
    ) {
      return c.json({ error: "Params mismatch" }, 403);
    }
  } catch {
    return c.json({ error: "Invalid or expired token" }, 403);
  }
  const body = await c.req.arrayBuffer();
  await appendPart(decodeURIComponent(uploadId), Number(partNumber), Buffer.from(body));
  const etag = `"${Buffer.from(body).length}-${partNumber}"`;
  return c.json({ etag }, 200);
});

export const mockS3Routes = app;
