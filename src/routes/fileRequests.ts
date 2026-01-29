import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { FileRequestModel } from "../models/FileRequest.js";
import { FileModel } from "../models/File.js";
import { hashPassword, verifyPassword, signToken } from "../services/auth.js";
import {
  generateKey,
  getSignedUploadUrl,
  getSignedPartUrl,
  getSignedDownloadUrl,
  completeMultipartStore,
  deleteStored,
  cleanupStaleMultipartDirs,
} from "../services/mockS3.js";
import { runAsync } from "../helpers/asyncTasks.js";
import { authMiddleware } from "../middleware/auth.js";
import {
  requireValidRequestId,
  requireUploader,
  requireViewer,
  type FileRequestVariables,
} from "../middleware/fileRequestAuth.js";
import { rateLimitMiddleware } from "../middleware/rateLimit.js";
import { sanitizeFileName } from "../helpers/validation.js";
import { isValidObjectId } from "../helpers/objectId.js";

const app = new Hono<{ Variables: FileRequestVariables }>();

const JSON_BODY_LIMIT = 1024 * 1024; // 1MB
app.use("*", rateLimitMiddleware);
app.use("*", bodyLimit({ maxSize: JSON_BODY_LIMIT, onError: (c) => c.json({ error: "Request body too large" }, 413) }));

const createSchema = z.object({
  uploadPassword: z.string().min(8),
  downloadPassword: z.string().min(8),
  name: z.string().optional(),
});
const authSchema = z.object({ password: z.string().min(1) });
const MAX_FILE_NAME_LENGTH = 255;
const MAX_CONTENT_TYPE_LENGTH = 100;
const DANGEROUS_TYPES = ["application/x-msdownload", "application/x-msdos-program"];

const uploadUrlSchema = z
  .object({
    fileName: z.string().min(1).max(MAX_FILE_NAME_LENGTH),
    contentType: z.string().max(MAX_CONTENT_TYPE_LENGTH).optional().default("application/octet-stream"),
  })
  .refine((data) => !DANGEROUS_TYPES.includes(data.contentType ?? ""), {
    message: "Content type not allowed",
    path: ["contentType"],
  });
const partUrlSchema = z.object({ partNumber: z.number().int().min(1) });
const completeSchema = z.object({
  parts: z.array(z.object({ partNumber: z.number(), etag: z.string() })),
});
const uploadCompleteSchema = z.object({
  fileId: z.string().min(1),
  size: z.number().int().min(0),
});

function getFrontendOrigin(): string {
  return process.env.FRONTEND_ORIGIN || "http://localhost:3000";
}

app.post("/", zValidator("json", createSchema), async (c) => {
  const { uploadPassword, downloadPassword, name } = c.req.valid("json");
  const passwordHash = await hashPassword(uploadPassword);
  const downloadPasswordHash = await hashPassword(downloadPassword);
  const doc = await FileRequestModel.create({
    passwordHash,
    downloadPasswordHash,
    name: name ?? "",
  });
  const uploadLink = `${getFrontendOrigin()}/share/${doc._id}`;
  const downloadLink = `${getFrontendOrigin()}/share/${doc._id}/download`;
  return c.json({
    id: String(doc._id),
    uploadLink,
    uploadPassword,
    downloadLink,
    downloadPassword,
  });
});

app.post("/:id/auth", zValidator("json", authSchema), async (c) => {
  const id = c.req.param("id");
  if (!isValidObjectId(id)) return c.json({ error: "Invalid request id" }, 400);
  const { password } = c.req.valid("json");
  const doc = await FileRequestModel.findById(id);
  if (!doc) return c.json({ error: "File request not found" }, 404);
  const ok = await verifyPassword(password, doc.passwordHash);
  if (!ok) return c.json({ error: "Invalid password" }, 401);
  const token = signToken({ requestId: id, role: "uploader" });
  return c.json({ token });
});

app.post("/:id/auth-download", zValidator("json", authSchema), async (c) => {
  const id = c.req.param("id");
  if (!isValidObjectId(id)) return c.json({ error: "Invalid request id" }, 400);
  const { password } = c.req.valid("json");
  const doc = await FileRequestModel.findById(id);
  if (!doc) return c.json({ error: "File request not found" }, 404);
  if (!doc.downloadPasswordHash) return c.json({ error: "Download not set up for this request" }, 400);
  const ok = await verifyPassword(password, doc.downloadPasswordHash);
  if (!ok) return c.json({ error: "Invalid password" }, 401);
  const token = signToken({ requestId: id, role: "viewer" });
  return c.json({ token });
});

app.post(
  "/:id/upload-url",
  authMiddleware,
  requireValidRequestId,
  requireUploader,
  zValidator("json", uploadUrlSchema),
  async (c) => {
    const id = c.get("requestId");
    const req = await FileRequestModel.findById(id);
    if (!req) return c.json({ error: "File request not found" }, 404);
    const { fileName, contentType } = c.req.valid("json");
    const safeName = sanitizeFileName(fileName);
    const key = generateKey(`file-requests/${id}`);
    const fileDoc = await FileModel.create({
      fileRequestId: req._id,
      key,
      originalName: safeName,
      contentType: contentType || "application/octet-stream",
      completed: false,
    });
    const { url, method, expiresIn } = getSignedUploadUrl(key, contentType);
    return c.json({
      url,
      method,
      expiresIn,
      fileId: String(fileDoc._id),
      key,
    });
  }
);

app.post(
  "/:id/upload-complete",
  authMiddleware,
  requireValidRequestId,
  requireUploader,
  zValidator("json", uploadCompleteSchema),
  async (c) => {
    const id = c.get("requestId");
    const { fileId, size } = c.req.valid("json");
    const fileDoc = await FileModel.findOne({
      _id: fileId,
      fileRequestId: id,
      uploadId: null,
    });
    if (!fileDoc) return c.json({ error: "File not found" }, 404);
    await FileModel.updateOne(
      { _id: fileDoc._id },
      { $set: { completed: true, size } }
    );
    runAsync(cleanupStaleMultipartDirs);
    return c.json({ fileId, completed: true });
  }
);

app.post(
  "/:id/multipart/init",
  authMiddleware,
  requireValidRequestId,
  requireUploader,
  zValidator("json", uploadUrlSchema),
  async (c) => {
    const id = c.get("requestId");
    const req = await FileRequestModel.findById(id);
    if (!req) return c.json({ error: "File request not found" }, 404);
    const { fileName, contentType } = c.req.valid("json");
    const safeName = sanitizeFileName(fileName);
    const key = generateKey(`file-requests/${id}`);
    const uploadId = `mp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const fileDoc = await FileModel.create({
      fileRequestId: req._id,
      key,
      originalName: safeName,
      contentType: contentType || "application/octet-stream",
      uploadId,
      completed: false,
    });
    return c.json({ uploadId, fileId: String(fileDoc._id), key });
  }
);

app.post(
  "/:id/multipart/:uploadId/part-url",
  authMiddleware,
  requireValidRequestId,
  requireUploader,
  zValidator("json", partUrlSchema),
  async (c) => {
    const id = c.get("requestId");
    const uploadId = c.req.param("uploadId");
    const fileDoc = await FileModel.findOne({ fileRequestId: id, uploadId });
    if (!fileDoc) return c.json({ error: "Upload not found" }, 404);
    const { partNumber } = c.req.valid("json");
    const { url, method } = getSignedPartUrl(uploadId, fileDoc.key, partNumber);
    return c.json({ url, method, partNumber });
  }
);

app.post(
  "/:id/multipart/:uploadId/complete",
  authMiddleware,
  requireValidRequestId,
  requireUploader,
  zValidator("json", completeSchema),
  async (c) => {
    const id = c.get("requestId");
    const uploadId = c.req.param("uploadId");
    const fileDoc = await FileModel.findOne({ fileRequestId: id, uploadId });
    if (!fileDoc) return c.json({ error: "Upload not found" }, 404);
    const { parts } = c.req.valid("json");
    const partNumbers = parts.map((p) => p.partNumber);
    await completeMultipartStore(uploadId, fileDoc.key, partNumbers);
    await FileModel.updateOne(
      { _id: fileDoc._id },
      { $set: { completed: true, uploadId: null, parts: parts } }
    );
    runAsync(cleanupStaleMultipartDirs);
    return c.json({ fileId: String(fileDoc._id), completed: true });
  }
);

app.get("/:id/files", authMiddleware, requireValidRequestId, requireViewer, async (c) => {
  const id = c.get("requestId");
  const files = await FileModel.find({ fileRequestId: id, completed: true }).lean();
  return c.json({
    files: files.map((f) => ({
      id: String(f._id),
      originalName: f.originalName,
      size: f.size,
      contentType: f.contentType,
      createdAt: f.createdAt,
    })),
  });
});

app.get("/:id/download-url/:fileId", authMiddleware, requireValidRequestId, requireViewer, async (c) => {
  const id = c.get("requestId");
  const fileId = c.req.param("fileId");
  if (!isValidObjectId(fileId)) return c.json({ error: "Invalid file id" }, 400);
  const fileDoc = await FileModel.findOne({ _id: fileId, fileRequestId: id });
  if (!fileDoc) return c.json({ error: "File not found" }, 404);
  const { url, method, expiresIn } = getSignedDownloadUrl(fileDoc.key);
  return c.json({ url, method, expiresIn, originalName: fileDoc.originalName });
});

app.delete(
  "/:id/files/:fileId",
  authMiddleware,
  requireValidRequestId,
  requireUploader,
  async (c) => {
    const id = c.get("requestId");
    const fileId = c.req.param("fileId");
    if (!isValidObjectId(fileId)) return c.json({ error: "Invalid file id" }, 400);
    const fileDoc = await FileModel.findOne({ _id: fileId, fileRequestId: id });
    if (!fileDoc) return c.json({ error: "File not found" }, 404);
    const key = fileDoc.key;
    await FileModel.deleteOne({ _id: fileDoc._id });
    runAsync(() => deleteStored(key));
    return c.json({ deleted: true, fileId });
  }
);

export const fileRequestsRoutes = app;
