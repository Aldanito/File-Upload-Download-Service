import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import fs from "fs/promises";
import path from "path";
import type {
  UploadTokenPayload,
  UploadPartTokenPayload,
  DownloadTokenPayload,
  UploadTokenDecoded,
  UploadPartTokenDecoded,
  DownloadTokenDecoded,
} from "../types/mockS3.js";

const EXPIRES_IN = "15m";

function getUploadsDir(): string {
  const dir = process.env.UPLOADS_DIR ?? path.join(process.cwd(), "uploads");
  return path.resolve(dir);
}

function resolveKey(key: string): string {
  const uploadsDir = getUploadsDir();
  const parts = key.split(/[/\\]/).filter((p) => p.length > 0 && p !== "..");
  const resolved = path.resolve(uploadsDir, ...parts);
  const base = path.resolve(uploadsDir);
  if (resolved !== base && !resolved.startsWith(base + path.sep)) {
    throw new Error("Invalid key: path traversal not allowed");
  }
  return resolved;
}

async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

function getSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not set");
  return s;
}

function getBaseUrl(): string {
  return process.env.BASE_URL || "http://localhost:3001";
}

export function generateKey(prefix: string): string {
  const safe = randomBytes(12).toString("hex");
  return `${prefix}/${safe}`;
}

export function getSignedUploadUrl(key: string, _contentType?: string): { url: string; method: string; expiresIn: number } {
  const secret = getSecret();
  const payload: UploadTokenPayload = { key, action: "upload" };
  const token = jwt.sign(payload, secret, { expiresIn: EXPIRES_IN });
  const base = getBaseUrl();
  const url = `${base}/mock-s3/upload?key=${encodeURIComponent(key)}&token=${token}`;
  return { url, method: "PUT", expiresIn: 900 };
}

export function getSignedPartUrl(uploadId: string, key: string, partNumber: number): { url: string; method: string } {
  const secret = getSecret();
  const payload: UploadPartTokenPayload = { key, uploadId, partNumber, action: "uploadPart" };
  const token = jwt.sign(payload, secret, { expiresIn: EXPIRES_IN });
  const base = getBaseUrl();
  const url = `${base}/mock-s3/multipart/part?key=${encodeURIComponent(key)}&uploadId=${encodeURIComponent(uploadId)}&partNumber=${partNumber}&token=${token}`;
  return { url, method: "PUT" };
}

export function getSignedDownloadUrl(key: string): { url: string; method: string; expiresIn: number } {
  const secret = getSecret();
  const payload: DownloadTokenPayload = { key, action: "download" };
  const token = jwt.sign(payload, secret, { expiresIn: EXPIRES_IN });
  const base = getBaseUrl();
  const url = `${base}/mock-s3/download?key=${encodeURIComponent(key)}&token=${token}`;
  return { url, method: "GET", expiresIn: 900 };
}

export function verifyUploadToken(token: string): UploadTokenDecoded {
  const decoded = jwt.verify(token, getSecret()) as UploadTokenPayload;
  if (decoded.action !== "upload") throw new Error("Invalid token");
  return { key: decoded.key };
}

export function verifyPartToken(token: string): UploadPartTokenDecoded {
  const decoded = jwt.verify(token, getSecret()) as UploadPartTokenPayload;
  if (decoded.action !== "uploadPart") throw new Error("Invalid token");
  return { key: decoded.key, uploadId: decoded.uploadId, partNumber: decoded.partNumber };
}

export function verifyDownloadToken(token: string): DownloadTokenDecoded {
  const decoded = jwt.verify(token, getSecret()) as DownloadTokenPayload;
  if (decoded.action !== "download") throw new Error("Invalid token");
  return { key: decoded.key };
}

export async function storeChunk(key: string, chunk: Buffer): Promise<void> {
  const filePath = resolveKey(key);
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, chunk);
}

export async function appendPart(uploadId: string, partNumber: number, chunk: Buffer): Promise<void> {
  const partKey = path.join("multipart", uploadId, String(partNumber));
  const filePath = resolveKey(partKey);
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, chunk);
}

export async function getPart(uploadId: string, partNumber: number): Promise<Buffer | undefined> {
  const partKey = path.join("multipart", uploadId, String(partNumber));
  const filePath = resolveKey(partKey);
  try {
    return await fs.readFile(filePath);
  } catch {
    return undefined;
  }
}

export async function completeMultipartStore(
  uploadId: string,
  key: string,
  partNumbers: number[]
): Promise<void> {
  const parts: Buffer[] = [];
  const sorted = [...partNumbers].sort((a, b) => a - b);
  for (const n of sorted) {
    const chunk = await getPart(uploadId, n);
    if (chunk) parts.push(chunk);
  }
  await storeChunk(key, Buffer.concat(parts));
  const uploadsDir = getUploadsDir();
  const multipartDir = path.resolve(uploadsDir, "multipart", uploadId);
  try {
    for (const n of sorted) {
      await fs.unlink(path.join(multipartDir, String(n)));
    }
    await fs.rmdir(multipartDir);
  } catch {
    // ignore cleanup errors
  }
}

export async function getStored(key: string): Promise<Buffer | undefined> {
  const filePath = resolveKey(key);
  try {
    return await fs.readFile(filePath);
  } catch {
    return undefined;
  }
}

export async function deleteStored(key: string): Promise<void> {
  const filePath = resolveKey(key);
  try {
    await fs.unlink(filePath);
  } catch {
    // ignore if file already missing
  }
}

const STALE_MULTIPART_AGE_MS = 60 * 60 * 1000; // 1 hour

/**
 * Removes multipart temp dirs older than 1 hour (e.g. abandoned uploads).
 * Safe to run in background.
 */
export async function cleanupStaleMultipartDirs(): Promise<void> {
  const uploadsDir = getUploadsDir();
  const multipartDir = path.join(uploadsDir, "multipart");
  try {
    const entries = await fs.readdir(multipartDir, { withFileTypes: true });
    const now = Date.now();
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const dirPath = path.join(multipartDir, e.name);
      try {
        const stat = await fs.stat(dirPath);
        if (now - stat.mtimeMs > STALE_MULTIPART_AGE_MS) {
          await fs.rm(dirPath, { recursive: true });
        }
      } catch {
        // ignore per-dir errors
      }
    }
  } catch {
    // multipart dir may not exist yet
  }
}
